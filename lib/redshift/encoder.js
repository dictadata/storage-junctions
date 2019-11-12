/**
 * redshift/encoder
 */
"use strict"

const sqlString = require('sqlstring');
const isoString = require('../lib/isostring');
const ynBoolean = require('yn');
const logger = require('../logger');

/**
 * convert a redshift type to a storage type
 * returns an array with [storageType,size]
 */
var storageType = exports.storageType = function (redshiftType) {
  let mst = '';
  let sz = '';

  // format is usually "name(size)" e.g. "int(11)"
  let found = false;
  for (let i = 0; i < redshiftType.length; i++) {
    if (redshiftType[i] === '(')
      found = true;
    else if (redshiftType[i] === ')')
      break;
    else if (!found)
      mst += redshiftType[i];
    else
      sz += redshiftType[i];
  }

  let size = parseInt(sz);

  // convert to storage type
  let fldType = 'undefined';
  switch (mst.toUpperCase()) {
    case 'TINYINT':
    case 'SMALLINT':
    case 'INT':
    case 'MEDIUMINT':
    case 'YEAR':
      fldType = 'integer';
      break;

    case 'FLOAT':
    case 'DOUBLE':
      fldType = 'float';
      break;

    case 'TIMESTAMP':
    case 'DATE':
    case 'DATETIME':
      fldType = 'date';
      break;

    case 'CHAR':
    case 'VARCHAR':
    case 'TINYTEXT':
    case 'MEDIUMTEXT':
    case 'LONGTEXT':
    case 'TEXT':
    case 'DECIMAL':  // odd balls
    case 'BIGINT':
    case 'TIME':
    case 'GEOMETRY':
      fldType = 'text';
      break;

    case 'ENUM':
    case 'SET':
      fldType = 'keyword';
      break;

    case 'TINYBLOB':
    case 'MEDIUMBLOB':
    case 'LONGBLOB':
    case 'BLOB':
    case 'BINARY':
    case 'VARBINARY':
    case 'BIT':
      fldType = 'binary';
      break;
  }

  return [fldType, size];
}

/**
 * convert a redshift column definition to a storage field definition
 */
var storageField = exports.storageField = function (column) {

  let [fldType,size] = storageType(column.Type);

  let field = {
    name: column.Field,
    type: fldType,
    size: size,
    default: column.Default || null,
    isNullable: ynBoolean(column.Null) || false,
    isKey: column.Key || false,
    // add additional Redshift fields
    _model_redshift: {
      Type: column.Type,
      Extra: column.Extra
    }
  };

  return field;
};

/**
 * return a redshift type from a storage field definition
 */
var redshiftType = exports.redshiftType = function (field) {
  let redshiftType = "VARCHAR(32)";

  if (field._model_redshift) {
    redshiftType = field._model_redshift.Type;
  }
  else {
    switch (field.type) {
      case "boolean":
        redshiftType ="TINYINT";
        break;
      case "integer":
        redshiftType ="INT";
        break;
      case "float":
        redshiftType ="DOUBLE";
        break;
      case "keyword":
        redshiftType ="VARCHAR(" + (field.size || 64) + ")";
        break;
      case "text":
        redshiftType ="VARCHAR(" + (field.size || 512) + ")";
        break;
      case "date":
        redshiftType ="DATETIME";
        break;
      case "binary":
        redshiftType ="BLOB";
        break;
    }
  }

  return redshiftType;
};

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
    sql += " " + redshiftType(field);

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
  let sql = "";

  if (engram.keys.length > 0) {
    sql += " WHERE";

    let first = true;
    for (let key of engram.keys) {
      let value = pattern.match[key];

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
