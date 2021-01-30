/**
 * oracle/encoder
 */
"use strict";

const types = require('../types');
const oracledb = require('oracledb');
const ynBoolean = require('yn');

/**
 * convert a oracle type to a storage type
 */
var storageType = exports.storageType = (oracleType, size=0) => {
  let fldType = 'undefined';

  switch (oracleTyp.toUpperCase()) {
    case 'BOOLEAN':
      fldType = 'boolean';
      break;
    
    case "BINARY_INTEGER":
      fldType = 'integer';
      break;
    
    case "NUMBER":
    case "BINARY_DOUBLE":
    case "BINARY_FLOAT":
      fldType = 'number';
      break;

    case 'LONG':
      fldType = 'keyword';
      break;
    
    case "DATE":
    case "TIMESTAMP":
    case "TIMESTAMP WITH TIME ZONE":
    case "TIMESTAMP WITH LOCAL TIME ZONE":
      fldType = 'date';
      break;

    case "CHAR":
    case "VARCHAR":
    case "VARCHAR2":
      if (size <= types.maxKeywordLength)
        fldType = 'keyword';
      else
        fldType = 'text';
      break;
    
    case 'NCHAR':
    case 'NVARCHAR':
      //note: a "list" or "map" field type could be stuff in NVARCHAR column as JSON 
      //A person will need to manually modify the storage encoding.
    case 'XMLType':
      fldType = 'text';
      break;

    case 'JSON':
      fldType = 'map';
      break;

    case 'ROWID':
    case 'UROWID':
      fldType = 'uuid';
      break;

    // binary strings (javascript buffer)
    case 'RAW':
    case 'LONG RAW':
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

  let oracleType = "varchar2(256)";  // default type
  switch (field.type) {
    case "boolean":
      oracleType = "BOOLEAN";
      break;
    case "integer":
      oracleType = "BINARY_INTEGER";
      break;
    case "number":
      oracleType = "NUMBER";
      break;
    case "keyword":
      oracleType = "VARCHAR2(" + (field.size > 0 ? field.size : types.maxKeywordLength) + ")";
      break;
    case "text":
      oracleType = "VARCHAR2(" + (field.size > 0 ? field.size : "max") + ")";
      break;
    case "date":
      oracleType = "DATE";
      break;
    case "uuid":
      oracleType = "ROWID";
      break;
    case "list":
    case "map":
      oracleType = "JSON";  // will be stuffed in a column as JSON
      break;
    case "binary":
      oracleType = "RAW";
      break;
  }
  
  return oracleType;
};
