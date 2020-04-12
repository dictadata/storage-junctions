/**
 * mysql/encoder
 */
"use strict";

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
      if (size === 1) {
        fldType = 'boolean';
        break;
      }
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
};

/**
 * convert a mysql column definition to a storage field definition
 */
exports.storageField = function (column) {

  let [fldType,size] = storageType(column.Type);

  let field = {
    name: column.Field,
    type: fldType,
    size: size,
    default: column.Default || null,
    isNullable: ynBoolean(column.Null) || false,
    isKey: column.Key || false,
    // add additional MySQL fields
    _model_mysql: {
      Type: column.Type,
      Extra: column.Extra
    }
  };

  return field;
};

/**
 * return a mysql type from a storage field definition
 */
exports.mysqlType = function (field) {
  let mysqlType = "VARCHAR(32)";

  if (field._model_mysql) {
    mysqlType = field._model_mysql.Type;
  }
  else {
    switch (field.type) {
      case "boolean":
        mysqlType ="TINYINT(1)";
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
        mysqlType ="VARCHAR(" + (field.size || 1024) + ")";
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

