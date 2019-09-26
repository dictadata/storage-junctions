/**
 * mysql/encoder
 */
"use strict"

const ynBoolean = require('yn');

/**
 * convert a mysql type to a storage type
 * returns an array with [storageType,size]
 */
var storageType = exports.storageType = function (mysqlType) {
  let mst = '';
  let sz = '';

  // format is usually "name(size)" e.g. "int(11)"
  let found = false;
  for (let i = 0; i < mysqlType.length; i++) {
    if (mysqlType[i] === '(')
      found = true;
    else if (mysqlType[i] === ')')
      break;
    else if (!found)
      mst += mysqlType[i];
    else
      sz += mysqlType[i];
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
 * convert a mysql column definition to a storage field definition
 */
var storageField = exports.storageField = function (column) {

  let [fldType,size] = storageType(column.Type);

  let field = {
    name: column.Field,
    type: fldType,
    size: size,
    default: column.Default || null,
    isNullable: ynBoolean(column.Null) || false,
    isKey: ynBoolean(column.Key) || false,
    // add additional MySQL fields
    mysql_Type: column.Type,
    mysql_Extra: column.Extra
  };

  return field;
};

/**
 * return a mysql type from a storage field definition
 */
var mysqlType = exports.mysqlType = function (field) {
  let mysqlType = "VARCHAR(32)";

  if (field.mysql_type) {
    mysqlType = field.mysql_type;
  }
  else {
    switch (field.type) {
      case "boolean":
        mysqlType ="TINYINT";
        break;
      case "integer":
        mysqlType ="INT";
        break;
      case "float":
        mysqlType ="DOUBLE";
        break;
      case "keyword":
        mysqlType ="VARCHAR(" + (field.size || 64) + ")";
        break;
      case "text":
        mysqlType ="VARCHAR(" + (field.size || 512) + ")";
        break;
      case "date":
        mysqlType ="DATETIME";
        break;
      case "binary":
        mysqlType ="BLOB";
        break;
    }
  }

  return mysqlType;
};


exports.sqlCreateTable = function (engram) {
  let sql = "CREATE TABLE " + engram.schema + " (";

  let first = true;

  for (let [name, field] of Object.entries(engram.encoding.fields)) {
    if (first)
      first = false;
    else
      sql += ",";

    sql += "`" + name + "` ";
    sql += mysqlType(field);
    if (field.isNullable)
      sql += " NULL";
    if (field.default)
      sql += " " + field.default;  // should check field type and add quotes if necessary
    if (field.isKey)
      sql += " KEY";
  }

  sql += ");";

  return sql;
};

exports.sqlInsert = function (engram, construct) {

  let names = Object.keys(construct);
  let values = Object.values(construct);

  let sql = "INSERT INTO " + engram.schema + " (";
  let first = true;
  for (let name of names) {
    if (first)
      first = false;
    else
      sql += ",";
    sql += "`" + name + "`";
  }

  sql += ") VALUES (";
  first = true;
  for (let i = 0; i < names.length; i++) {
    let name = names[i];
    let value = values[i];
    let field = engram.encoding.fields[name];

    if (first)
      first = false;
    else
      sql += ",";

    switch(field.type) {
      case "boolean":
        sql += value ? 1 : 0;
        break;
      case "integer":
        sql += value;
        break;
      case "float":
        sql += value;
        break;
      case "keyword":
        sql += "'" + value + "'";
        break;
      case "text":
        sql += "'" + value + "'";
        break;
      case "date":
        if (value) {
          let d = value.toISOString().replace('T', ' ');
          sql += "'" + d.slice(0,d.length - 1) + "'";
        }
        else
          sql += null;
        break;
      case "binary":
        sql += "";   // to do figure out how to pass buffers
        break;
    }
  }
  sql += ");";

  return sql;
};

/**
 * options: {fieldname: value, ...}
 */
exports.sqlSelectWithKey = function (engram, options) {

  let sql = "SELECT * FROM " + this._engram.schema;

  if (engram.keys.length > 0) {
    sql += " WHERE";

    let first = true;
    for (let key of engram.keys) {
      let value = options[key];

      if (first)
        first = false;
      else
        sql += " AND";

      // check if value needs to be quoted
      let types = ['text','keyword','date'];
      if (types.includes(engram.encoding.fields[key].type))
        value = "'" + value + "'";

      sql += " " + key + "=" + value;
    }
  }

  return sql;
};

/**
 * pattern: { filter: {fieldname: value, ...}}
 */
exports.sqlSelectPattern = function (engram, pattern, options) {

  let sql = "SELECT * FROM " + this._engram.schema;

  if (pattern.filter) {
    sql += " WHERE";

    let first = true;
    for (let name in pattern.filter) {
      let value = pattern.filter[name];

      if (first)
        first = false;
      else
        sql += " AND";

      // check if value needs to be quoted
      let types = ['text', 'keyword', 'date'];
      if (types.includes(engram.encoding.fields[name].type))
        value = "'" + value + "'";

      sql += " " + name + "=" + value;
    }
  }

  return sql;
};
