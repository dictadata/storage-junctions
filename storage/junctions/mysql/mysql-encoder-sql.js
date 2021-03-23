/**
 * mysql/queries
 */
"use strict";

const encoder = require('./mysql-encoder');
const sqlString = require('sqlstring');
const { typeOf, hasOwnProperty, isDate, parseDate } = require('../../utils');
const logger = require('../../logger');
const { escapeId } = require('tsqlstring');


function encodeValue(field, value) {
  switch (field.type) {
    case "date":
      let dt = value;
      if (typeof value === "string")
        dt = (isDate(value) === 1) ? parseDate(value) : new Date(dt);
      return dt ? sqlString.escape(dt) : "NULL";
    case "boolean":
      return (value) ? 1 : 0;
    case "list":
    case "map":
      // json string representation
      return sqlString.escape(JSON.stringify(value));
    case "binary":
      return "NULL";   // to do figure out how to pass buffers
    default:
      return sqlString.escape(value);
  }
}

exports.decodeResults = function (engram, construct) {
  logger.debug("mysql decodeResults");
  if (typeOf(construct) !== "object") return;

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
      case "list":
      case "map":
        // stored as json string
        construct[name] = JSON.parse(value);
        break;
      case "binary":
        break;   // to do figure out how to pass buffers      
      default:
        // retrieved value should be good
    }
  }
};

exports.decodeIndexResults = (engram, columns) => {
  for (let column of columns) {
    if (column["Key_name"] === "PRIMARY") {
      // primary key's index
      let field = engram.find(column["Column_name"]);
      field.keyOrdinal = column["Seq_in_index"];
    }
    else {
      // other index
      if (!hasOwnProperty(engram, "indices")) engram.indices = {};
      if (!hasOwnProperty(engram.indices, column["Key_name"])) engram.indices[column["Key_name"]] = {fields: []};
      let index = engram.indices[column["Key_name"]];
      index.unique = !column["Non_unique"];
      index.fields[column["Seq_in_index"] - 1] = {
        "name": column["Column_name"],
        "order": column["Collation"] === 'D' ? "DESC" : "ASC"
      }
    }
  }
}

exports.sqlCreateTable = function (engram, options) {
  let sql = "CREATE TABLE " + engram.smt.schema + " (";
  let primaryKeys = [];

  let first = true;
  for (let [name, field] of Object.entries(engram.fields)) {
    (first) ? first = false : sql += ',';

    sql += " " + sqlString.escapeId(name);
    sql += " " + encoder.mysqlType(field);

    if (field.isKey) {
      primaryKeys[field.keyOrdinal-1] = sqlString.escapeId(name);
      field.isNullable = false;
    }

    if (field.isNullable)
      sql += " NULL";
    else
      sql += " NOT NULL";

    if (field.default)
      sql += " DEFAULT " + sqlString.escape(field.default);
  }

  if (primaryKeys.length > 0) {
    sql += ", PRIMARY KEY (" + primaryKeys.join(', ') + ")";
  }

  // other indexes
  if (!options.bulkLoad && engram.indices) {
    for (let [name, index] of Object.entries(engram.indices)) {
      sql += ","
      if (index.unique) sql += " UNIQUE "
      sql += "INDEX " + sqlString.escapeId(name) + "(";
      let first = true;
      for (let col of index.fields) {
        (first) ? first = false : sql += ",";
        sql += sqlString.escapeId(col.name);
        if (col.order) sql += " " + col.order;
      }
      sql += ")";
    }
  }

  sql += ");";
  return sql;
};

exports.sqlInsertUpdate = function (engram, construct) {

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
    sql += encodeValue(field,value);
  }
  sql += ")";

  if (engram.keys.length > 0 && engram.keys.length < engram.fieldsLength) {
    sql += " ON DUPLICATE KEY UPDATE";

    first = true;
    for (let i = 0; i < names.length; i++) {
      let name = names[i];
      if (!engram.keys.includes(name)) {
        let field = engram.find(name);
        let value = values[i];
        (first) ? first = false : sql += ",";
        sql += sqlString.escapeId(name) + "=" + encodeValue(field, value);
      }
    }
  }

  logger.debug(sql);
  return sql;
};

exports.sqlBulkInsert = function (engram, constructs) {

  // all constructs MUST have the same fields
  let names = Object.keys(constructs[0]);

  let sql = "INSERT INTO " + engram.smt.schema + " (";
  let first = true;
  for (let name of names) {
    (first) ? first = false : sql += ",";
    sql += sqlString.escapeId(name);
  }
  sql += ") VALUES ";
  
  first = true;
  for (let construct of constructs) {
    (first) ? first = false : sql += ",";
    sql += "(";

    let vfirst = true;
    for (let i = 0; i < names.length; i++) {
      let name = names[i];
      let value = construct[name];
      let field = engram.find(name);
      (vfirst) ? vfirst = false : sql += ",";
      sql += encodeValue(field, value);
    }
    sql += ")";
  }

  logger.debug(sql);
  return sql;
};

/**
 * options: {fieldname: value, ...}
 */
exports.sqlWhereFromKey = (engram, pattern) => {
  const match = (pattern && pattern.match) || pattern || {};
  let sql = "";

  if (engram.keys.length > 0) {
    sql += " WHERE ";

    let first = true;
    for (let key of engram.keys) {
      let value = match[key];
      (first) ? first = false : sql += " AND ";
      sql += sqlString.escapeId(key) + "=" + encodeValue(engram.find(key), value);
    }
  }

  logger.debug(sql);
  return sql;
};

/**
 * Pattern for aggregation
 * 
 * filter constructs:
 *   match: {<field>: value, ...}
 *   match: {<field>: {"op": value, ...}}
 * choose fields:
 *   fields: [<field>, ...]
 * OR
 * aggregate summary:
 *   aggregate: {"<as name>": {"func": "field"}}
 * aggregate groupby
 *   aggregate: {"<groupby field>": {"<as name>": {"func", "field"}}}
 */
exports.sqlSelectWithPattern = function (engram, pattern) {

  let sql = "SELECT ";
  let columns = [];

  // OUTPUT COLUMNS
  if (pattern.fields) {
    for (let f of pattern.fields)
      columns.push(sqlString.escapeId(f));
  }
  else if (pattern.aggregate) {
    // find all the {"func": "field"} expressions
    for (let [name,exp] of Object.entries(pattern.aggregate)) {
      for (let [func,value] of Object.entries(exp)) {
        if (typeOf(value) === "object") {
          // the field to GROUPBY
          let groupby = sqlString.escapeId(name);
          if (!columns.includes(groupby))
            columns.push(groupby);
          // aggregate columns for GROUP BY
          let asfld = func;
          for (let [func,fld] of Object.entries(value)) {
            let exp = sqlFunction(func) + "(" + sqlString.escapeId(fld) + ")";
            columns.push(exp + " as " + sqlString.escapeId(asfld));
          }
        }
        else {
          // aggregate columns for summary
          let asfld = name;
          let fld = value;
          let exp = sqlFunction(func) + "(" + sqlString.escapeId(fld) + ")";
          columns.push(exp + " as " + sqlString.escapeId(asfld));
        }
      }
    }
  }

  if (columns.length === 0)
    sql += "*";
  else
    sql += columns.join(",");

  // FROM clause
  sql += " FROM " + engram.smt.schema;

  // WHERE clause
  if (pattern && pattern.match) {
    sql += " WHERE ";

    let first = true;
    for (let [fldname,value] of Object.entries(pattern.match)) {
      if (typeOf(value) === 'object') {
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
        sql += sqlString.escapeId(fldname) + "=" + encodeValue(engram.find(fldname), value);
      }
    }
  }

  // GROUP BY clause
  if (pattern.aggregate) {
    let f = true;
    // find group by fields of aggregate: {"group_by_field": {"func": "field"} }
    for (let [groupby,exp] of Object.entries(pattern.aggregate)) {
      for (let [fld,funcfld] of Object.entries(exp)) {
        if (typeOf(funcfld) === "object") {
          // group by field
          if (f) sql += " GROUP BY ";
          (f) ? f = false : sql += ",";
          sql += sqlString.escapeId(groupby);
        }
        // else not groupby
        break;
      }
      // should only be one aggregate.property for group by
    }
  }

  // ORDER BY clause
  if (pattern.order) {
    sql += " ORDER BY ";
    let f = true;
    for (const [name, direction] of Object.entries(pattern.order)) {
      (f) ? f = false : sql += ",";
      sql += sqlString.escapeId(name) + " " + direction;
    }
  }

  // LIMIT clause
  if (pattern.count)
    sql += " LIMIT " + pattern.count;

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