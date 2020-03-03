/**
 * mysql/queries
 */
"use strict";

const encoder = require('./encoder');
const sqlString = require('sqlstring');
const isoString = require('../lib/isostring');
const logger = require('../logger');


function escapeValue(field, value) {
  switch (field.type) {
    case "binary":
      return "NULL";   // to do figure out how to pass buffers
    case "date":
      if ((typeof value === "object") && (value instanceof Date))
        return sqlString.escape(value);
      else if (typeof value === "string")
        return sqlString.escape(isoString.toDate(value));
    // eslint-disable-next-line no-fallthrough
    case "boolean":
      return (value) ? 1 : 0;
    case "integer":
    case "float":
    case "keyword":
    case "text":
    default:
      return sqlString.escape(value);
  }

}

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
      primkey.push(name);
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
    sql += ", PRIMARY KEY (" + primkey.join(',') + ")";
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
exports.sqlWhereFromKey = function (engram, pattern) {
  let match = pattern.match || {};
  let sql = "";

  if (engram.keys.length > 0) {
    sql += " WHERE";

    let first = true;
    for (let key of engram.keys) {
      let value = match[key];

      (first) ? first = false : sql += " AND";

      sql += " " + sqlString.escapeId(key) + "=" + escapeValue(engram.find(key), value);
    }
  }

  logger.debug(sql);
  return sql;
};

/**
 * pattern: { match: {fieldname: value, ...}}
 */
exports.sqlSelectWithPattern = function (engram, pattern) {

  let sql = "SELECT";
  if (pattern.cues && pattern.cues.fields)
    sql += " " + pattern.cues.fields.join(",");
  else
    sql += " *";
  sql += " FROM " + engram.smt.schema;

  if (pattern && pattern.match) {
    sql += " WHERE";

    let first = true;
    for (let name in pattern.match) {
      let value = pattern.match[name];

      if (typeof value === 'object') {
        for ( let [op,val] of Object.entries(value) ) {
          (first) ? first = false : sql += " AND";

          sql += " " + sqlString.escapeId(name);
          switch (op) {
            case 'gt': sql += " > "; break;
            case 'gte': sql += " >= "; break;
            case 'lt': sql += " < "; break;
            case 'lte': sql += " <= "; break;
            case 'eq': sql += " = "; break;
            case 'neq': sql += " != "; break;
            default: sql += " ??? ";
          }
          sql += escapeValue(engram.find(name), val);
        }
      }
      else {
        (first) ? first = false : sql += " AND";
        sql += " " + sqlString.escapeId(name) + "=" + escapeValue(engram.find(name), value);
      }
    }
  }

  if (pattern.cues && pattern.cues.order) {
    sql += " ORDER BY ";
    let f = true;
    for (const [name, direction] of Object.entries(pattern.cues.order)) {
      (f) ? f = false : sql += ",";
      sql += " " + sqlString.escapeId(name) + " " + direction;
    }
  }

  if (pattern.cues && pattern.cues.count)
    sql += " LIMIT " + pattern.cues.count;

  logger.verbose(sql);
  return sql;
};
