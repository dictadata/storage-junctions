/**
 * storage/types/storage-encoder
 *
 * NOTE: This is a template class file.
 *       For use by developers creating new junctions.
 *
 * Methods that handle the conversion of types
 * and queries between the junction and the source library.
 *
 */
"use strict";

const stringBreakpoints = require('./stringBreakpoints');
const { ynBoolean } = require('../utils');

module.exports = exports = class StorageEncoder {

  constructor(options) {
    this.options = options;
  }

  /**
   * convert a source type to a storage field type
   *
   * Implementors notes:
   *   replace srcType values with actual source types
   */
  storageType(srcType) {

    let fldType = 'unknown';
    switch (srcType.toUpperCase()) {
      case 'INT':
      case 'INTEGER':
        fldType = 'integer';
        break;

      case 'FLOAT':
      case 'DOUBLE':
        fldType = 'number';
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
  }

  /**
   * convert a column definition to a storage field definition
   * implementors notes:
   * replace srcdef.property with the approprieate proptery name
   */
  storageField(srcdef) {

    let field = {
      name: srcdef.Name,
      type: srcdef.Type,
      size: srcdef.Size,
      // add additional source fields
      _source: {
        Type: srcdef.Type,
        _Extra: srcdef.Extra
      }
    };

    if (Object.hasOwn(srcdef, "Default"))
      field.default = srcdef[ "Default" ];
    if (Object.hasOwn(srcdef, "Null"))
      field.nullable = ynBoolean(srcdef[ "Null" ]);
    if (Object.hasOwn(srcdef, "Key"))
      field.key = srcdef[ "Key" ];

    return field;
  }

  /**
   * return a source type from a storage field definition
   * implementors notes:
   * replace "src" with storage name e.g. "mysql", "mongodb", ...
   * returned property types for the data source
   */
  srcType(field) {
    let srcType = "";

    if (field.scr_type) {
      srcType = field.src_type;
    }
    else {
      switch (field.type.toLowerCase()) {
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
          srcType = "varchar(" + (field.size > 0 ? field.size : stringBreakpoints.keyword) + ")";
          break;
        case "string":
        case "text":
          srcType = "varchar(" + (field.size > 0 ? field.size : stringBreakpoints.text) + ")";
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
  }

};
