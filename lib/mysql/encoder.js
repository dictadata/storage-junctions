/**
 * mysql/encoder
 */
"use strict"

const ynBoolean = require('yn');

exports.storageField = function (column) {

  let [stype,size] = storageType(column.Type);

  let field = {
    name: column.Field,
    type: stype,
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

exports.createTable = function (encoding) {
  let sql = "CREATE TABLE " + encoding.container + " (";

  let first = true;

  for (let [name, field] of Object.entries(encoding.fields)) {
    if (first)
      first = false;
    else
      sql += ",";

    sql += "`" + name + "` ";

    if (field.mysql_type) {
      sql += field.mysql_type;
    }
    else {
      switch (field.type) {
        case "boolean":
          sql += "TINYINT";
          break;
        case "integer":
          sql += "INT";
          break;
        case "float":
          sql += "DOUBLE";
          break;
        case "keyword":
          sql += "VARCHAR(" + (field.size || 50) + ")";
          break;
        case "text":
          sql += "VARCHAR(" + (field.size || 250) + ")";
          break;
        case "date":
          sql += "DATETIME";
          break;
        case "binary":
          sql += "BLOB";
          break;
      }
    }

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

exports.createInsert = function (encoding, construct) {

  let names = Object.keys(construct);
  let values = Object.values(construct);

  let sql = "INSERT INTO " + encoding.container + " (";
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
    let field = encoding.fields[name];

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
 * parse MySQL types returned by DESCRIBE <table>
 * returns an array with [storageType,size]
 */
function storageType(mysqlType) {
  let t = '';
  let s = '';

  // format is usually "name(size)" e.g. "int(11)"
  let found = false;
  for (let i = 0; i < mysqlType.length; i++) {
    if (mysqlType[i] === '(')
      found = true;
    else if (mysqlType[i] === ')')
      break;
    else if (!found)
      t += mysqlType[i];
    else
      s += mysqlType[i];
  }

  let size = parseInt(s);

  // convert to storage type
  let sType = 'undefined';
  switch (t.toUpperCase()) {
    case 'TINYINT':
    case 'SMALLINT':
    case 'INT':
    case 'MEDIUMINT':
    case 'YEAR':
      sType = 'integer';
      break;

    case 'FLOAT':
    case 'DOUBLE':
      sType = 'float';
      break;

    case 'TIMESTAMP':
    case 'DATE':
    case 'DATETIME':
      sType = 'date';
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
      sType = 'text';
      break;

    case 'ENUM':
    case 'SET':
      sType = 'keyword';
      break;

    case 'TINYBLOB':
    case 'MEDIUMBLOB':
    case 'LONGBLOB':
    case 'BLOB':
    case 'BINARY':
    case 'VARBINARY':
    case 'BIT':
      sType = 'binary';
      break;
  }

  return [sType, size];
}
