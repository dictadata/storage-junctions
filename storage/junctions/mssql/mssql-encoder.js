/**
 * mssql/encoder
 */
"use strict";

const types = require('../types');
const TYPES = require('tedious').TYPES;
const ynBoolean = require('yn');

var stringBreakpoints = exports.stringBreakpoints = Object.assign({}, types.stringBreakpoints);
if (stringBreakpoints.text > 8000)
  stringBreakpoints.text = 8000;   // up to 32767 if MAX_STRING_SIZE = EXTENDED;

/**
 * convert a mssql type to a storage type
 */
var storageType = exports.storageType = (mssqlType, size=0) => {
  let fldType = 'undefined';

  switch (mssqlType.toUpperCase()) {
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
      fldType = 'keyword';
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
      if (size <= stringBreakpoints.keyword)
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
 * convert a mssql column definition to a storage field definition
 */
exports.storageField = (column) => {

  let sqlType = column["type"].value;
  let size = column["size"].value;

  let field = {
    name: column["name"].value,
    type: storageType(sqlType,size),
    size: column["size"].value,
    default: column["default"].value || null,
    isNullable: ynBoolean(column["is_nullable"].value) || false,
    keyOrdinal: types.hasOwnProperty(column, "key_ordinal") ? column["key_ordinal"].value : 0,
    // add additional MSSQL fields
    _mssql: {
      precision: column["precision"].value,
      scale: column["scale"].value
    }
  };

  let strTypes = ['varchar', 'char', 'text', 'nvarchar', 'nchar', 'ntext'];
  if (strTypes.includes(sqlType))
    field._mssql["type"] = sqlType + '(' + size + ')';
  else
    field._mssql["type"] = sqlType;

  return field;
};

/**
 * return a mssql type given a storage field definition
 */
exports.mssqlType = (field) => {
  if (field._mssql) {
    return field._mssql.type;
  }

  let mssqlType = "varchar(256)";  // default type
  switch (field.type) {
    case "boolean":
      mssqlType = "bit";
      break;
    case "integer":
      mssqlType = "int";
      break;
    case "number":
      mssqlType = "float";
      break;
    case "keyword":
      mssqlType = "varchar(" + (field.size > 0 ? field.size : stringBreakpoints.keyword) + ")";
      break;
    case "string":
    case "text":
      mssqlType = "varchar(" + (field.size > 0 && field.size <= stringBreakpoints.text ? field.size : "max") + ")";
      break;
    case "date":
      mssqlType = "datetime";
      break;
    case "uuid":
      mssqlType = "uniqueidentifier";
      break;
    case "list":
    case "map":
      mssqlType = "nvarchar(max)";  // will be stuffed in a column as JSON
      break;
    case "binary":
      mssqlType = "binary";
      break;
  }
  
  return mssqlType;
};
