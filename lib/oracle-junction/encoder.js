/**
 * oracle/encoder
 */
"use strict";

const types = require('../types');
const oracledb = require('oracledb');
const OracleDB = require('oracledb');

const _MAX = 4000;  // 32767 if MAX_STRING_SIZE = EXTENDED;

/**
 * convert an Oracle SQL type to a storage type
 */
var storageType = exports.storageType = (column) => {
 
  let fldType = 'undefined';
  switch (column.dbType) {
    case oracledb.DB_TYPE_BOOLEAN:
      fldType = 'boolean';
      break;
    
    case oracledb.DB_TYPE_BINARY_INTEGER:
      fldType = 'integer';
      break;
    
    case oracledb.DB_TYPE_NUMBER:
      if (column.byteSize === 38) {
        fldType = 'integer';
        break;
      }
    case oracledb.DB_TYPE_BINARY_DOUBLE:
    case oracledb.DB_TYPE_BINARY_FLOAT:
      fldType = 'number';
      break;

    case oracledb.DB_TYPE_LONG:
      fldType = 'keyword';
      break;
    
    case oracledb.DB_TYPE_DATE:
    case oracledb.DB_TYPE_TIMESTAMP:
    case oracledb.DB_TYPE_TIMESTAMP_TZ:
    case oracledb.DB_TYPE_TIMESTAMP_LTZ:
      fldType = 'date';
      break;

    case oracledb.DB_TYPE_CHAR:
      if (column.byteSize === 1) {
        fldType = 'boolean';
        break;
      }
    case oracledb.DB_TYPE_VARCHAR:
      if (column.byteSize <= types.maxKeywordLength)
        fldType = 'keyword';
      else
        fldType = 'text';
      break;
    
    case oracledb.DB_TYPE_NCHAR:
    case oracledb.DB_TYPE_NVARCHAR:
      fldType = 'text';
      break;

    case oracledb.DB_TYPE_JSON:
      //note: Could be a "list" or "map" storage type.
      //      A person will need to manually modify the storage encoding.
      fldType = 'map';
      break;

    case oracledb.DB_TYPE_ROWID:
      fldType = 'uuid';
      break;

    // binary strings (javascript buffer)
    case oracledb.DB_TYPE_RAW:
    case oracledb.DB_TYPE_LONG_RAW:
      fldType = 'binary';
      break;
  }

  return fldType;
};

/**
 * convert a oracle column definition to a storage field definition
 */
exports.storageField = (column) => {

  let field = {
    name: column["name"],
    type: storageType(column),
    size: (column["byteSize"]) ? column["byteSize"] : 0,
    isNullable: column["nullable"],
    //default: null,
    //isKey: columnDef["is_pkey"].value || false,

    // add additional Oracle fields
    _oracle: column
  };

  return field;
};

/**
 * return a Oracle SQL type given a storage field definition
 */
exports.sqlType = (field) => {
  if (field._oracle) {
    let type = field._oracle.dbTypeName;

    if (field._oracle.byteSize)
      type += "(" + field._oracle.byteSize + ")";
    else if (field._oracle.precision) {
      if (field._oracle.precision === 126)
        type = "FLOAT(126)"
      else
        type += "(" + field._oracle.precision + "," + field._oracle.scale + ")";
    }
    
    return type;
  }

  let sqlType = "VARCHAR2(256)";  // default type
  switch (field.type) {
    case "boolean":
      sqlType = "CHAR";
      break;
    case "integer":
      sqlType = "INTEGER";
      break;
    case "number":
      sqlType = "FLOAT";
      break;
    case "keyword":
      sqlType = "VARCHAR2(" + (field.size > 0 ? field.size : types.maxKeywordLength) + ")";
      break;
    case "text":
      sqlType = "VARCHAR2(" + (field.size > 0 ? field.size : _MAX) + ")";
      break;
    case "date":
      sqlType = "DATE";
      break;
    case "uuid":
      sqlType = "ROWID";
      break;
    case "list":
    case "map":
      sqlType = "VARCHAR2(" + _MAX + ")";  // will be stuffed in a column as JSON
      break;
    case "binary":
      sqlType = "RAW";
      break;
  }
  
  return sqlType;
};



/**
 * DEPRECATED
 * convert an Oracle SQL type to a storage type
 */
var storageType_SQL = exports.storageType_SQL = (sqlType) => {
  let mst = '';
  let sz = '';

  // format is usually "name(size)" e.g. "int(11)"
  let found = false;
  for (let i = 0; i < sqlType.length; i++) {
    if (sqlType[i] === '(')
      found = true;
    else if (sqlType[i] === ')')
      break;
    else if (!found)
      mst += sqlType[i];
    else
      sz += sqlType[i];
  }
  let size = parseInt(sz);

  let fldType = 'undefined';
  switch (sqlType.toUpperCase()) {
    case 'BOOLEAN':
      fldType = 'CHAR';
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
 * DEPRECATED
 * convert a oracle column definition to a storage field definition
 */
exports.storageField_SQL = (column) => {

  let [fldType,size] = storageType(column["Type"]);

  let field = {
    name: column["Name"],
    type: fldType,
    size: size,
    isNullable: !(column["Null?"] === "NOT NULL") || true,
    default: null,
    //isKey: columnDef["is_pkey"].value || false,
    // add additional Oracle fields
    _oracle: {
      Type: column["Type"]
    }
  };

  return field;
};

