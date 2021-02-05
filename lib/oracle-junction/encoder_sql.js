/**
 * oracle/queries
 */
"use strict";

const encoder = require('./encoder');
const types = require('../types');
const isoDates = require('../utils/isoDates');
const getCI = require("../utils/getCI");
const logger = require('../logger');

//var _reservedWords = ["ACCESS", "ELSE", "MODIFY", "START", "ADD", "EXCLUSIVE", "NOAUDIT", "SELECT", "ALL", "EXISTS", "NOCOMPRESS", "SESSION", "ALTER", "FILE", "NOT", "SET", "AND", "FLOAT", "NOTFOUND", "SHARE", "ANY", "FOR", "NOWAIT", "SIZE", "ARRAYLEN", "FROM", "NULL", "SMALLINT", "AS", "GRANT", "NUMBER", "SQLBUF", "ASC", "GROUP", "OF", "SUCCESSFUL", "AUDIT", "HAVING", "OFFLINE", "SYNONYM", "BETWEEN", "IDENTIFIED", "ON", "SYSDATE", "BY", "IMMEDIATE", "ONLINE", "TABLE", "CHAR", "IN", "OPTION", "THEN", "CHECK", "INCREMENT", "OR", "TO", "CLUSTER", "INDEX", "ORDER", "TRIGGER", "COLUMN", "INITIAL", "PCTFREE", "UID", "COMMENT", "INSERT", "PRIOR", "UNION", "COMPRESS", "INTEGER", "PRIVILEGES", "UNIQUE", "CONNECT", "INTERSECT", "PUBLIC", "UPDATE", "CREATE", "INTO", "RAW", "USER", "CURRENT", "IS", "RENAME", "VALIDATE", "DATE", "LEVEL", "RESOURCE", "VALUES", "DECIMAL", "LIKE", "REVOKE", "VARCHAR", "DEFAULT", "LOCK", "ROW", "VARCHAR2", "DELETE", "LONG", "ROWID", "VIEW", "DESC", "MAXEXTENTS", "ROWLABEL", "WHENEVER", "DISTINCT", "MINUS", "ROWNUM", "WHERE", "DROP", "MODE", "ROWS", "WITH"];

function escapeId(name) {
  /*
  // check that characters are alphanumeric or _ # $
  let rx = new RegExp(/^[0-9A-Za-z_#\$]+$/);
  if (!rx.test(name) || _reservedWords.includes(name.toUpperCase()))
    // quoted identifier
    return '"' + name + '"';
  else
    // unquoted identifier
    return name;
  */
  
  let cname = name.replace(/"/g, '""');
  return '"' + cname + '"';
}

function escapeString(value) {
  if (typeof value === "string") {
    value = value.replace(/'/g, "''");
    return "'" + value + "'";
  }
  else
    return value;
}

function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

function formatSQLDate(date, withMS = false) {
  let df = "YYYY-MM-DD HH24:MI:SS";
  let ds = date.getUTCFullYear() +
    '-' + pad(date.getUTCMonth() + 1) +
    '-' + pad(date.getUTCDate()) +
    ' ' + pad(date.getUTCHours()) +
    ':' + pad(date.getUTCMinutes()) +
    ':' + pad(date.getUTCSeconds());
  if (withMS) {
    df += ".FF3"
    ds += '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5)
  }
  return "TO_DATE('" + ds + "','" + df + "')"
};
    
function encodeValue(field, value) {
  switch (field.type) {
    case "date":
      if ((typeof value === "object") && (value instanceof Date))
        return formatSQLDate(value);
      else if (typeof value === "string" && types.isDate(value))
        return formatSQLDate(isoDates.parseDate(value));
      else
        return "NULL";
    case "boolean":
      return (value) ? 1 : 0;
    case "list":
    case "map":
      // stuff json representation in a column
      return escapeString(JSON.stringify(value));
    case "binary":
      return "NULL";   // to do figure out how to pass buffers
    default:
      return escapeString(value);
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
  let primaryKeys = [];

  let first = true;

  for (let [name, field] of Object.entries(engram.fields)) {
    if (first)
      first = false;
    else
      sql += ",";

    sql += " " + escapeId(name);
    sql += " " + encoder.sqlType(field);

    if (field.isKey) {
      primaryKeys[field.keyOrdinal-1] = sqlString.escapeId(name);
      field.isNullable = false;
    }

    if (field.isNullable)
      sql += " NULL";
    else
      sql += " NOT NULL";

    if (field.default)
      sql += " DEFAULT " + escapeString(field.default);
  }

  if (primaryKeys.length > 0) {
    sql += ", PRIMARY KEY (" + primaryKeys.join(', ') + ")";
  }
  sql += ")";

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
      let value = getCI(match, key);
      (first) ? first = false : sql += " AND ";
      sql += escapeId(key) + "=" + encodeValue(engram.find(key), value);
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
exports.sqlSelectWithPattern = (engram, pattern) => {

  let sql = "SELECT ";

  // OUTPUT COLUMNS
  let columns = [];
  if (pattern.fields) {
    for (let f of pattern.fields)
      columns.push(escapeId(f));
  }
  else if (pattern.aggregate) {
    // find all the {"func": "field"} expressions
    for (let [name,exp] of Object.entries(pattern.aggregate)) {
      for (let [func,value] of Object.entries(exp)) {
        if (typeof value === "object") {
          // the field to group by
          let groupby = escapeId(name);
          if (!columns.includes(groupby))
            columns.push(groupby);
          // aggregate columns for GROUP BY
          let asfld = func;
          for (let [func,fld] of Object.entries(value)) {
            let exp = aggFunction(func) + "(" + escapeId(fld) + ")";
            columns.push(exp + " as " + escapeId(asfld));
          }
        }
        else {
          // totals aggregation functions
          let asfld = name;
          let fld = value;
          let exp = aggFunction(func) + "(" + escapeId(fld) + ")";
          columns.push(exp + " as " + escapeId(asfld));
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

  // GROUP BY clause
  if (pattern.aggregate) {
    let f = true;
    // find group by fields of aggregate: {"group_by_field": {"func": "field"} }
    for (let [groupby,exp] of Object.entries(pattern.aggregate)) {
      for (let [fld,funcfld] of Object.entries(exp)) {
        if (typeof funcfld === "object") {
          // group by field
          if (f) sql += " GROUP BY ";
          (f) ? f = false : sql += ",";
          sql += escapeId(groupby);
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
      sql += escapeId(name) + " " + direction;
    }
  }

  // LIMIT clause
  if (pattern.count)
    sql += ` FETCH FIRST ${pattern.count} ROWS ONLY`;
  
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