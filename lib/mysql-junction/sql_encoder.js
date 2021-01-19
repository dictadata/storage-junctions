/**
 * mysql/queries
 */
"use strict";

const encoder = require('./encoder');
const sqlString = require('sqlstring');
const types = require('../types');
const isoString = require('../utils/isostring');
const logger = require('../logger');


function escapeValue(field, value) {
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
    case "binary":
      return "NULL";   // to do figure out how to pass buffers
    default:
      return sqlString.escape(value);
  }
}

exports.validateResults = function (engram, construct) {
  logger.debug("sqlQuery.validateResults");
  if (typeof construct !== "object") return;

  for (let [name, value] of Object.entries(construct)) {
    let field = engram.find(name);
    switch (field.type) {
      case "date":
        if (typeof value === "string" && value.startsWith("0000"))
          construct[name] = null;
        break;
      case "boolean":
        construct[name] = (value) ? true : false;
        break;
      default:
        // do nothing
    }
  }
};

exports.sqlCreateTable = function (engram) {
  let sql = "CREATE TABLE " + engram.smt.schema + " (";
  let primkey = [];

  let first = true;

  for (let [name, field] of Object.entries(engram.fields)) {
    if (first)
      first = false;
    else
      sql += ",";

    sql += " " + sqlString.escapeId(name);
    sql += " " + encoder.mysqlType(field);

    if (field.isKey) {
      primkey.push(sqlString.escapeId(name));
      field.isNullable = false;
    }

    if (field.isNullable)
      sql += " NULL";
    else
      sql += " NOT NULL";

    if (field.default)
      sql += " " + field.default;  // should check field type and add quotes if necessary
  }

  if (primkey.length > 0) {
    sql += ", PRIMARY KEY (" + primkey.join(', ') + ")";
  }

  sql += ");";

  logger.verbose(sql);
  return sql;
};

exports.sqlInsert = function (engram, construct) {

  let names = Object.keys(construct);
  let values = Object.values(construct);

  let sql = "INSERT INTO " + engram.smt.schema + " (";
  let first = true;
  for (let name of names) {
    (first) ? first = false : sql += ",";
    sql += sqlString.escapeId(name);
  }
  sql += ") VALUES (";
  first = true;
  for (let i = 0; i < names.length; i++) {
    let name = names[i];
    let value = values[i];
    let field = engram.find(name);
    (first) ? first = false : sql += ",";
    sql += escapeValue(field,value);
  }
  sql += ")";

  if (engram.keys.length > 0) {
    sql += " ON DUPLICATE KEY UPDATE";

    first = true;
    for (let i = 0; i < names.length; i++) {
      let name = names[i];
      let value = values[i];
      let field = engram.find(name);
      if (!field.isKey) {
        (first) ? first = false : sql += ",";
        sql += sqlString.escapeId(name) + "=" + escapeValue(field, value);
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
      let value = match[key];
      (first) ? first = false : sql += " AND ";
      sql += sqlString.escapeId(key) + "=" + escapeValue(engram.find(key), value);
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
exports.sqlSelectWithPattern = function (engram, pattern) {

  let sql = "SELECT ";
  let columns = [];
  if (pattern.fields) {
    for (let f of pattern.fields)
      columns.push(sqlString.escapeId(f));
  }
  if (pattern.aggregate) {
    // find all the {"func": "field"} expressions
    for (let [name,exp] of Object.entries(pattern.aggregate)) {
      for (let [func,value] of Object.entries(exp)) {
        if (typeof value === "object") {
          // group by aggregation functions
          let groupby = name;
          columns.push(sqlString.escapeId(groupby));
          let newfld = func;
          for (let [func,fld] of Object.entries(value)) {
            let exp = sqlFunction(func) + "(" + sqlString.escapeId(fld) + ")";
            columns.push(exp + " as " + sqlString.escapeId(newfld));
          }
        }
        else {
          // totals aggregation functions
          let newfld = name;
          let fld = value;
          let exp = sqlFunction(func) + "(" + sqlString.escapeId(fld) + ")";
          columns.push(exp + " as " + sqlString.escapeId(newfld));
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

          sql += sqlString.escapeId(fldname);
          switch (op) {
            case 'gt': sql += " > "; break;
            case 'gte': sql += " >= "; break;
            case 'lt': sql += " < "; break;
            case 'lte': sql += " <= "; break;
            case 'eq': sql += " = "; break;
            case 'neq': sql += " != "; break;
            case 'wc': sql += " LIKE ";
              val = val.replace("*", "%").replace("?", "_");
              break;
            default: sql += " ??? ";
          }
          sql += escapeValue(engram.find(fldname), val);
        }
      }
      else {
        // single property { field: value }
        (first) ? first = false : sql += " AND ";
        sql += sqlString.escapeId(fldname) + "=" + escapeValue(engram.find(fldname), value);
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
          sql += sqlString.escapeId(groupby);
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
      sql += sqlString.escapeId(name) + " " + direction;
    }
  }

  if (pattern.count)
    sql += " LIMIT " + pattern.count;

  logger.verbose(sql);
  return sql;
};

function sqlFunction(cfunc) {
  switch (cfunc) {
    case 'sum': return 'SUM';
    case 'avg': return 'AVG';
    case 'min': return 'MIN';
    case 'max': return 'MAX';
    case 'count': return 'COUNT';
    default: return cfunc;
  }
}