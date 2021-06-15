/**
 * oracledb/encoder
 */
"use strict";

var { hasOwnProperty } = require('../../utils');
var { stringBreakpoints } = require('../../types');
const oracledb = require('oracledb');

stringBreakpoints = exports.stringBreakpoints = Object.assign({}, stringBreakpoints);
if (stringBreakpoints.text > 4000)
  stringBreakpoints.text = 4000;   // up to 32767 if MAX_STRING_SIZE = EXTENDED;

/**
 * convert storage field type to Oracle SQL type 
 */
exports.sqlType = (field) => {
  if (field._oracle) {
    let type = field._oracle.DATA_TYPE;

    if (field._oracle.DATA_LENGTH && field._oracle.DATA_TYPE !== "DATE")
      type += "(" + field._oracle.DATA_LENGTH + ")";
    else if (field._oracle.DATA_PRECISION) {
      if (field._oracle.DATA_PRECISION === 126)
        type = "FLOAT(126)"
      else
        type += "(" + field._oracle.DATA_PRECISION + "," + field._oracle.DATA_SCALE + ")";
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
      sqlType = "NVARCHAR2(" + (field.size > 0 ? field.size : stringBreakpoints.keyword) + ")";
      break;
    case "string":
    case "text":
      if (field.size > stringBreakpoints.text)
        sqlType = "CLOB"
      else
        sqlType = "NVARCHAR2(" + (field.size > 0 ? field.size : stringBreakpoints.keyword) + ")";
      break;
    case "date":
      sqlType = "DATE";
      break;
    case "uuid":
      sqlType = "ROWID";
      break;
    case "list":
    case "map":
      sqlType = "CLOB";  // will be stuffed in a column as JSON
      break;
    case "binary":
      sqlType = "RAW";
      break;
  }
  
  return sqlType;
};

/**
 * convert storage field type to Oracle SQL type 
 */
exports.sqlTypeDB = (field) => {
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
      sqlType = "NVARCHAR2(" + (field.size > 0 ? field.size : stringBreakpoints.keyword) + ")";
      break;
    case "string":
    case "text":
      if (field.size > stringBreakpoints.text)
        sqlType = "CLOB"
      else
        sqlType = "NVARCHAR2(" + (field.size > 0 ? field.size : stringBreakpoints.keyword) + ")";
      break;
    case "date":
      sqlType = "DATE";
      break;
    case "uuid":
      sqlType = "ROWID";
      break;
    case "list":
    case "map":
      sqlType = "CLOB";  // will be stuffed in a column as JSON
      break;
    case "binary":
      sqlType = "RAW";
      break;
  }
  
  return sqlType;
};

/**
 * convert Oracle client db type to a storage field type
 */
var storageTypeDB = exports.storageTypeDB = (column) => {
 
  let fldType = 'unknown';
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
    case oracledb.DB_TYPE_NCHAR:
    case oracledb.DB_TYPE_NVARCHAR:
      if (column.byteSize <= stringBreakpoints.keyword) {
        fldType = 'keyword';
        break;
      }
    case oracledb.DB_TYPE_LONG:
    case oracledb.DB_TYPE_CLOB:
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
 * convert Oracle client column definition to storage field encoding
 * output from results with metadata
 */
exports.storageFieldDB = (column) => {

  let field = {
    name: column["name"],
    type: storageTypeDB(column),
    size: (column["byteSize"]) ? column["byteSize"] : 0,
    nullable: column["nullable"],
    //default: null,
    //key: set from constraints,

    // add additional Oracle fields
    _oracle: column
  };

  return field;
};

/**
 * convert an Oracle SQL type to a storage type
 */
var storageType = exports.storageType = (sqlType, sqlSize) => {
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
  let size = sqlSize || parseInt(sz);

  let fldType = 'unknown';
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

    case "DATE":
    case "TIMESTAMP":
    case "TIMESTAMP WITH TIME ZONE":
    case "TIMESTAMP WITH LOCAL TIME ZONE":
      fldType = 'date';
      break;

    case "CHAR":
      if (size === 1) {
        fldType = 'boolean';
        break;
      }
    case "VARCHAR":
    case "VARCHAR2":
    case 'NCHAR':
    case 'NVARCHAR':
    case 'NVARCHAR2':
      if (size <= stringBreakpoints.keyword) {
        fldType = 'keyword';
        break;
      }
    case 'LONG':
    case 'CLOB':
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

  return [fldType, size];
};

/**
 * convert Oracle SQL column definition to a storage field definition
 * output from SELECT ... FROM user_tab_columns
 */
let storageField = exports.storageField = (column) => {
  // COLUMN_ID, COLUMN_NAME, DATA_TYPE, DATA_LENGTH, DATA_PRECISION, DATA_SCALE, NULLABLE, DATA_DEFAULT

  let fldType, size;
  [fldType, size] = storageType(column["DATA_TYPE"], column["CHAR_LENGTH"] || column["DATA_LENGTH"]);

  let field = {
    name: column["COLUMN_NAME"],
    type: fldType,
    size: size,
    nullable: (column["NULLABLE"] === 'Y'),
    //ordinal: column["COLUMN_ID"]
    //key: set from constraints
  }
  if (column["DATA_DEFAULT"])
    field['default'] = column["DATA_DEFAULT"];

  // add additional Oracle fields
  field._oracle = column;

  return field;
}

/**
 * convert Oracle SQL column definition to a storage field definition
 * output from DESCRIBE <table> or other external definition
 */
let storageFieldSQL = exports.storageFieldSQL = (column) => {

  let fldType, size;
  if (hasOwnProperty(column, "Type"))
    // from DESCRIBE <table>
    [fldType, size] = storageType(column["Type"]);
  else
    // external definitions, e.g. Excel, .csv, ...
    [fldType, size] = storageType(column["TYPE"], column["LENGTH"]);

  let field = {
    name: column["Name"] || column["NAME"],
    type: fldType,
    size: size,
    nullable: !(column["Null?"] === "NOT NULL") || column["NULLABLE"] || true,
    //key: set from constraints
  }

  if (hasOwnProperty(column, "DEFAULT"))
    field.defaultValue = column["DEFAULT"];
  //if (hasOwnProperty(column, "ORDINAL"))
  //  field.ordinal = column["ORDINAL"] || null;

  // add additional Oracle fields
  field._oracle = column;

  return field;
}
