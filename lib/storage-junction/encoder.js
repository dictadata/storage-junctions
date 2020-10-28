/**
 * junction/encoder
 *
 * Example functions that handle the conversion of types
 * and queries between the junction and the source library.
 *
 * For internal use by junction developers only.
 */
"use strict";

const ynBoolean = require('yn');

/**
 * convert a mysql type to a storage field type
 *
 * Implementors notes:
 *   replace srcType values with actual source types
 */
exports.storageType = function storageType(srcType) {

  let fldType = 'undefined';
  switch (srcType.toUpperCase()) {
    case 'INT':
    case 'INTEGER':
      fldType = 'integer';
      break;

    case 'FLOAT':
    case 'DOUBLE':
      fldType = 'float';
      break;

    case 'DATE':
    case 'TIMESTAMP':
      fldType = 'date';
      break;

    case 'CHAR':
    case 'VARCHAR':
      fldType = 'text';
      break;

    case 'ENUM':
    case 'SET':
      fldType = 'keyword';
      break;

    case 'BLOB':
    case 'BINARY':
      fldType = 'binary';
      break;
  }

  return fldType;
};

/**
 * convert a column definition to a storage field definition
 * implementors notes:
 * replace srcdef.property with the approprieate proptery name
 */
exports.storageField = function storageField(srcdef) {

  let field = {
    name: srcdef.Name,
    type: srcdef.Type,
    size: srcdef.Size,
    default: srcdef.Default || null,
    isNullable: ynBoolean(srcdef.Null) || false,
    isKey: ynBoolean(srcdef.Key) || false,
    // add additional MySQL fields
    mysql_Type: srcdef.Type,
    mysql_Extra: srcdef.Extra
  };

  return field;
};

/**
 * return a source type from a storage field definition
 * implementors notes:
 * replace "src" with storage name e.g. "mysql", "mongodb", ...
 * returned propery types for the data source
 */
exports.srcType = function srcType(field) {
  let srcType = "";

  if (field.scr_type) {
    srcType = field.src_type;
  }
  else {
    switch (field.type) {
      case "boolean":
        srcType = "bool";
        break;
      case "integer":
        srcType = "int";
        break;
      case "number":
        srcType = "double";
        break;
      case "keyword":
        srcType = "char(" + (field.size || 64) + ")";
        break;
      case "text":
        srcType = "varchar(" + (field.size || 1024) + ")";
        break;
      case "date":
        srcType = "datetime";
        break;
      case "binary":
        srcType = "blob";
        break;
    }
  }

  return srcType;
};
