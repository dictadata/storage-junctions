/**
 * oracle/queries
 */
"use strict";

const encoder = require('./encoder');
const sqlString = require('sqlstring');
const types = require('../types');
const isoString = require('../utils/isostring');
const logger = require('../logger');

function escapeId(name) {
  // check that characters are alphanumeric or _ # $
  let rx = new RegExp(/^[0-9A-Za-z_#\$]+$/);
  if (rx.test(name))
    // unquoted identifier
    return name;
  else
    // quoted identifier
    return '"' + name + '"';
}

function encodeValue(field, value) {
  switch (field.type) {
    case "date":
      if ((typeof value === "object") && (value instanceof Date))
        return sqlString.escape(value);
      else if (typeof value === "string" && types.isDate(value))
        return sqlString.escape(isoString.toDate(value));
      else
        return "NULL";
    case "boolean":
      return (value) ? 1 : 0;
    case "list":
    case "map":
      // stuff json representation in a column
      return sqlString.escape(JSON.stringify(value));
    case "binary":
      return "NULL";   // to do figure out how to pass buffers
    default:
      return sqlString.escape(value);
  }
}

exports.decodeResults = (engram, construct) => {
  logger.debug("oracle decodeResults");
  if (typeof construct !== "object") return;

  for (let [name, value] of Object.entries(construct)) {
    let field = engram.find(name);
    switch (field.type) {
      case "date":
        break;
      case "boolean":
        construct[name] = (value) ? true : false;
        break;
      case "list":
      case "map":
        // unstuff the stored json representation
        construct[name] = JSON.parse(value);
        break;
      case "binary":
        break;   // to do figure out how to pass buffers      
      default:
         // retrieved value should be good
    }
  }

};

exports.sqlDescribeTable = (schema) => {
  return `SELECT * FROM ${schema.toUpperCase()} FETCH FIRST 1 ROW ONLY`;
};

exports.sqlConstraintColumns = (schema) => {
  return `SELECT cols.column_name, cols.position, cons.status
 FROM all_constraints cons, all_cons_columns cols
 WHERE cols.table_name = '${schema.toUpperCase()}'
 AND cons.constraint_type = 'P'
 AND cons.constraint_name = cols.constraint_name
 AND cons.owner = cols.owner
 ORDER BY cols.table_name, cols.position`;
};

exports.sqlCreateTable = (engram) => {
  let sql = "CREATE TABLE " + engram.smt.schema + " (";
  let primkey = [];

  let first = true;

  for (let [name, field] of Object.entries(engram.fields)) {
    if (first)
      first = false;
    else
      sql += ",";

    sql += " " + escapeId(name);
    sql += " " + encoder.sqlType(field);

    if (field.isKey)
      sql += " PRIMARY KEY"
    else if (field.isNullable)
      sql += " NULL";
    else
      sql += " NOT NULL";

    if (field.default)
      sql += " DEFAULT " + sqlString.escape(field.default);
  }

  sql += ")";

  logger.verbose(sql);
  return sql;
};

exports.sqlInsert = (engram, construct) => {

  let names = Object.keys(construct);
  let values = Object.values(construct);

  let sql = "INSERT INTO " + engram.smt.schema + " (";
  let first = true;
  for (let name of names) {
    (first) ? first = false : sql += ",";
    sql += escapeId(name);
  }
  sql += ") VALUES (";
  first = true;
  /* TBD parameterized statements
  for (let name of names) {
    (first) ? first = false : sql += ",";
    sql += ":" + escapeId(name);
  }
  */
  for (let i = 0; i < names.length; i++) {
    let name = names[i];
    let value = values[i];
    let field = engram.find(name);
    (first) ? first = false : sql += ",";
    sql += encodeValue(field,value);
  }
  sql += ")";

  logger.debug(sql);
  return sql;
};

exports.sqlUpdate = (engram, construct) => {

  let names = Object.keys(construct);
  let values = Object.values(construct);

  let sql = "UPDATE " + engram.smt.schema + " SET ";

  // non-key fields
  let first = true;
  for (let i = 0; i < names.length; i++) {
    let name = names[i];
    let value = values[i];
    let field = engram.find(name);
    if (!field.isKey) {
      (first) ? first = false : sql += ", ";
      sql += escapeId(name) + "=" + encodeValue(field, value);
    }
  }

  if (engram.keys.length > 0) {
    sql += " WHERE ";

    // key fields
    first = true;
    for (let i = 0; i < names.length; i++) {
      let name = names[i];
      let value = values[i];
      let field = engram.find(name);
      if (field.isKey) {
        (first) ? first = false : sql += " AND ";
        sql += escapeId(name) + "=" + encodeValue(field, value);
      }
    }
  }

  logger.debug(sql);
  return sql;
};

/**
 * options: {fieldname: value, ...}
 */
exports.sqlWhereFromKey = (engram, pattern) => {
  let match = (pattern && pattern.match) || pattern || {};
  let sql = "";

  if (engram.keys.length > 0) {
    sql += " WHERE ";

    let first = true;
    for (let key of engram.keys) {
      let value = types.getCI(match, key);
      (first) ? first = false : sql += " AND ";
      sql += escapeId(key) + "=" + encodeValue(engram.find(key), value);
    }
  }

  logger.debug(sql);
  return sql;
};

/**
 * filter patterns
 * select: { match: {field1: value} }
 * expression: { match: {field1: {"op": value}} }
 *
 * aggregate patterns:
 * function: { aggregate: {"newfield": {"func": "field1"}} }
 * group by: { aggregate: {"field1": {"newfield": {"func", "field2"}}} }
 */
exports.sqlSelectWithPattern = (engram, pattern) => {

  let sql = "SELECT ";

  let columns = [];
  if (pattern.fields) {
    for (let f of pattern.fields)
      columns.push(escapeId(f));
  }
  if (pattern.aggregate) {
    // find all the {"func": "field"} expressions
    for (let [name,exp] of Object.entries(pattern.aggregate)) {
      for (let [func,value] of Object.entries(exp)) {
        if (typeof value === "object") {
          // group by aggregation functions
          let groupby = name;
          columns.push(escapeId(groupby));
          let newfld = func;
          for (let [func,fld] of Object.entries(value)) {
            let exp = aggFunction(func) + "(" + escapeId(fld) + ")";
            columns.push(exp + " as " + escapeId(newfld));
          }
        }
        else {
          // totals aggregation functions
          let newfld = name;
          let fld = value;
          let exp = aggFunction(func) + "(" + escapeId(fld) + ")";
          columns.push(exp + " as " + escapeId(newfld));
        }
      }
    }
  }
  if (columns.length === 0)
    sql += "*";
  else
    sql += columns.join(",");

  sql += " FROM " + engram.smt.schema;

  if (pattern && pattern.match) {
    sql += " WHERE ";

    let first = true;
    for (let [fldname,value] of Object.entries(pattern.match)) {
      if (typeof value === 'object') {
        // expression(s) { op: value, ...}
        for (let [op,val] of Object.entries(value)) {
          (first) ? first = false : sql += " AND ";

          sql += escapeId(fldname);
          switch (op) {
            case 'gt': sql += " > "; break;
            case 'gte': sql += " >= "; break;
            case 'lt': sql += " < "; break;
            case 'lte': sql += " <= "; break;
            case 'eq': sql += " = "; break;
            case 'neq': sql += " != "; break;
            case 'wc': sql += " LIKE ";
              val = val.replace(/\*/g, "%").replace(/\?/g, "_");
              break;
            default: sql += " ??? ";
          }
          sql += encodeValue(engram.find(fldname), val);
        }
      }
      else {
        // single property { field: value }
        (first) ? first = false : sql += " AND ";
        sql += escapeId(fldname) + "=" + encodeValue(engram.find(fldname), value);
      }
    }
  }

  if (pattern.aggregate) {
    let f = true;
    // find group by fields of aggregate: {"group_by_field": {"func": "field"} }
    for (let [groupby,exp] of Object.entries(pattern.aggregate)) {
      for (let [fld,funcfld] of Object.entries(exp)) {
        if (typeof funcfld === "object") {
          // group by aggregation functions
          if (f) sql += " GROUP BY ";
          (f) ? f = false : sql += ",";
          sql += escapeId(groupby);
        }
        // else not groupby
      }
    }
  }

  if (pattern.order) {
    sql += " ORDER BY ";
    let f = true;
    for (const [name, direction] of Object.entries(pattern.order)) {
      (f) ? f = false : sql += ",";
      sql += escapeId(name) + " " + direction;
    }
  }

  if (pattern.count)
    sql += ` FETCH FIRST ${pattern.count} ROWS ONLY`;
  
  logger.verbose(sql);
  return sql;
};

function aggFunction(cfunc) {
  switch (cfunc) {
    case 'sum': return 'SUM';
    case 'avg': return 'AVG';
    case 'min': return 'MIN';
    case 'max': return 'MAX';
    case 'count': return 'COUNT';
    default: return cfunc;
  }
}