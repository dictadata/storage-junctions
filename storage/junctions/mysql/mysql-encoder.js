/**
 * mysql/encoder
 */
"use strict";

var { stringBreakpoints } = require('../../types');
const { Types } = require('mysql');
const ynBoolean = require('yn');
const hasOwnProperty = require('../../utils/hasOwnProperty');

stringBreakpoints = exports.stringBreakpoints = Object.assign({}, stringBreakpoints);
// short text use storage default
// could be up to 65535, but that is also the limit for the entire row

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
  let fldType = 'unknown';
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

    case 'JSON':
      //note: a "list" or "map" field type could be stuff in a JSON column 
      //A person will need to manually modify the storage encoding.
      fldType = 'map';   // or 'list'
      break;
    
    case 'CHAR':
    case 'VARCHAR':
      if (size <= stringBreakpoints.keyword)
        fldType = 'keyword';
      else
        fldType = 'text';
      break;
    
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
    // add additional MySQL fields
    _mysql: {
      Type: column.Type
    }
  };

  if (hasOwnProperty(column, "Default"))
    field.defaultValue = column["Default"];
  if (hasOwnProperty(column, "Null"))
    field.nullable = ynBoolean(column.Null);
  if (column.Key)
    field.key = 1;
  if (column.Extra) {
    field._mysql.Extra = column.Extra
  }

  // make sure isNullable and default are valid
  //if ((field.type === 'keyword' || field.type === 'text') && !field.isNullable && field.defaultValue === null)
  //    field.defaultValue = '';

  return field;
};

/**
 * return a mysql type from a storage field definition
 */
exports.mysqlType = function (field) {
  if (field._mysql) {
    return field._mysql.Type;
  }

  let mysqlType = "VARCHAR(256)";
  switch (field.type) {
    case "boolean":
      mysqlType = "TINYINT(1)";
      break;
    case "integer":
      mysqlType = "INT";
      break;
    case "number":
      mysqlType = "DOUBLE";
      break;
    case "keyword":
      mysqlType = "VARCHAR(" + (field.size > 0 ? field.size : stringBreakpoints.keyword) + ")";
      break;
    case "string":
    case "text":
      if (field.size < 0 || field.size > stringBreakpoints.text)
        mysqlType = "TEXT"
      else
        mysqlType = "VARCHAR(" + (field.size > 0 ? field.size : stringBreakpoints.keyword) + ")";
      break;
    case "date":
      mysqlType = "DATETIME";
      break;
    case "list":
    case "map":
      mysqlType = "JSON";
      break;
    case "binary":
      mysqlType ="BLOB";
      break;
  }

  return mysqlType;
};
