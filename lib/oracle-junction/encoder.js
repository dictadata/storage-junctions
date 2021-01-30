/**
 * oracle/encoder
 */
"use strict";

const types = require('../types');
const TYPES = require('tedious').TYPES;
const ynBoolean = require('yn');

/**
 * convert a oracle type to a storage type
 */
var storageType = exports.storageType = (oracleType, size=0) => {
  let fldType = 'undefined';

  switch (oracleType.toUpperCase()) {
    case 'BIT':
    case 'TINYINT':
      if (size === 1) {
        fldType = 'boolean';
        break;
      }
    case 'SMALLINT':
    case 'INT':
    case 'Numeric':
    case 'YEAR':
      fldType = 'integer';
      break;
    
    case 'BIGINT':
      fldType = 'text';
      break;
    
    case 'NUMERIC':
    case 'DECIMAL':
    case 'SMALLMONEY':
    case 'MONEY':
    case 'REAL':
    case 'FLOAT':
      fldType = 'number';
      break;

    case 'DATETIME':
    case 'DATETIME2':
    case 'DATE':
    case 'TIME':
    case 'SMALLDATETIME':
    case "DATETIMEOFFSET":
      fldType = 'date';
      break;

    case 'CHAR':
    case 'VARCHAR':
      if (size <= types.maxKeywordLength)
        fldType = 'keyword';
      else
        fldType = 'text';
      break;
    
    case 'TEXT':
    case 'NCHAR':
    case 'NVARCHAR':
      //note: a "list" or "map" field type could be stuff in NVARCHAR column as JSON 
      //A person will need to manually modify the storage encoding.
    case 'NTEXT':
    case 'XML':
      fldType = 'text';
      break;

    case 'uniqueidentifier':
      fldType = 'uuid';
      break;

    // binary strings (javascript buffer)
    case 'BINARY':
    case 'VARBINARY':
    case 'IMAGE':
      fldType = 'binary';
      break;
  }

  return fldType;
};

/**
 * convert a oracle column definition to a storage field definition
 */
exports.storageField = (columnDef) => {

  let sqlType = columnDef["type"].value;
  let size = columnDef["size"].value;

  let field = {
    name: columnDef["name"].value,
    type: storageType(sqlType,size),
    size: columnDef["size"].value,
    default: columnDef["default"].value || null,
    isNullable: ynBoolean(columnDef["is_nullable"].value) || false,
    isKey: columnDef["is_pkey"].value || false,
    // add additional Oracle fields
    _oracle: {
      precision: columnDef["precision"].value,
      scale: columnDef["scale"].value
    }
  };

  let strTypes = ['varchar', 'char', 'text', 'nvarchar', 'nchar', 'ntext'];
  if (strTypes.includes(sqlType))
    field._oracle["type"] = sqlType + '(' + size + ')';
  else
    field._oracle["type"] = sqlType;

  return field;
};

/**
 * return a oracle type given a storage field definition
 */
exports.oracleType = (field) => {
  if (field._oracle) {
    return field._oracle.type;
  }

  let oracleType = "varchar(256)";  // default type
  switch (field.type) {
    case "boolean":
      oracleType = "bit";
      break;
    case "integer":
      oracleType = "int";
      break;
    case "number":
      oracleType = "float";
      break;
    case "keyword":
      oracleType = "varchar(" + (field.size > 0 ? field.size : types.maxKeywordLength) + ")";
      break;
    case "text":
      oracleType = "varchar(" + (field.size > 0 ? field.size : "max") + ")";
      break;
    case "date":
      oracleType = "datetime";
      break;
    case "uuid":
      oracleType = "uniqueidentifier";
      break;
    case "list":
    case "map":
      oracleType = "nvarchar(max)";  // will be stuffed in a column as JSON
      break;
    case "binary":
      oracleType = "binary";
      break;
  }
  
  return oracleType;
};
