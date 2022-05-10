/**
 * rest/encoder
 *
 * Functions that handle the conversion of types
 * and queries between the junction and the source library.
 *
 */
"use strict";

const StorageEncoder = require('../storage-junction/storage-encoder');
const { storageType } = require('../../types');
const { typeOf, hasOwnProperty } = require('../../utils');
const dot = require('dot-object');
const ynBoolean = require('yn');

module.exports = exports = class RestEncoder extends StorageEncoder {

  constructor(storageJunction, options) {
    super(storageJunction, options);
  }

  /**
   * convert a REST type to a storage field type
   *
   * Implementors notes:
   *   replace srcType values with actual source types
   */
  storageType(srcType) {
    let fldType = 'unknown';

    switch (srcType.toUpperCase()) {
      default:
        fldType = 'unknown';
        break;
    }

    return fldType;
  }

  /**
   * return a source type from a storage field definition
   * implementors notes:
   * replace "src" with storage name e.g. "mysql", "mongodb", ...
   * returned propery types for the data source
   */
  srcType(field) {
    let srcType = "";

    if (field.scr_type) {
      srcType = field.src_type;
    }
    else {
      switch (field.type.toLowerCase()) {
        default:
          srcType = "unknown";
          break;
      }
    }

    return srcType;
  }

  /**
   * convert a source column definition to a storage field definition
   * implementors notes:
   * replace srcdef.property with the approprieate proptery name
   */
  storageField(srcdef) {

    let field = {
      name: srcdef.Name,
      type: storageType(srcdef.Type),
      size: srcdef.Size,
      // add additional REST fields
      _rest: {
        Type: srcdef.Type,
        Extra: srcdef.Extra
      }
    };

    if (hasOwnProperty(srcdef, "Default"))
      field.defaultValue = srcdef[ "Default" ];
    if (hasOwnProperty(srcdef, "Null"))
      field.nullable = ynBoolean(srcdef[ "Null" ]);
    if (hasOwnProperty(srcdef, "Key"))
      field.key = srcdef[ "Key" ];

    return field;
  }

  parseData(data, options, callback) {
    if (typeof data !== 'object')
      throw new Error("invalid json data");

    data = (options.extract && dot.pick(options.extract, data)) || data;

    if (typeOf(data) === "object") {
      if (options.objects) {
        // data is multiple objects
        for (const construct of Object.values(data))
          callback(construct);
      }
      else
        callback(data);  // data is a single object
    }

    if (typeOf(data) !== "array")
      return;

    // data is an array
    if (options.array_of_arrays) {
      // assume data is an array of arrays

      // check if options.array_of_arrays is array with field names
      let header = Array.isArray(options.array_of_arrays) ? options.array_of_arrays : null;

      for (let arr of data) {
        if (!header)
          // assume first array is header with field names
          header = arr;
        else {
          // convert array to object
          let construct = {};
          for (let i = 0; i < header.length; i++) {
            if (i >= arr.length)
              break;
            construct[ header[ i ] ] = arr[ i ];
          }
          callback(construct);
        }
      }
    }
    else {
      // assume data is an array of objects
      for (const construct of data) {
        callback(construct);
      }
    }
  }

};
