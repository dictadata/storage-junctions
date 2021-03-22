/**
 * rest/encoder
 *
 * Example functions that handle the conversion of types
 * and queries between the junction and the source library.
 *
 * Intended for internal use by junction developers only.
 */
"use strict";

const ynBoolean = require('yn');

/**
 * convert a REST type to a storage field type
 *
 * Implementors notes:
 *   replace srcType values with actual source types
 */
var storageType = exports.storageType = function (srcType) {

  let fldType = 'undefined';

  switch (srcType.toUpperCase()) {
    default:
      fldType = 'undefined';
      break;
  }

  return fldType;
};

/**
 * return a source type from a storage field definition
 * implementors notes:
 * replace "src" with storage name e.g. "mysql", "mongodb", ...
 * returned propery types for the data source
 */
var srcType = exports.srcType = function (field) {
  let srcType = "";

  if (field.scr_type) {
    srcType = field.src_type;
  }
  else {
    switch (field.type) {
      default:
        srcType = "undefined";
        break;
    }
  }

  return srcType;
};

/**
 * convert a source column definition to a storage field definition
 * implementors notes:
 * replace srcdef.property with the approprieate proptery name
 */
var storageField = exports.storageField = function (srcdef) {

  let field = {
    name: srcdef.Name,
    type: storageType(srcdef.Type),
    size: srcdef.Size,
    default: srcdef.Default || null,
    isNullable: ynBoolean(srcdef.Null) || false,
    keyOrdinal: ynBoolean(srcdef.Key) || false,
    // add additional REST fields
    _rest: {
      Type: srcdef.Type,
      Extra: srcdef.Extra
    }
  };

  return field;
};

exports.parseData = function (data, options, callback) {
  const extract = options.extract || options || {};
  const names = (extract.names && data[extract.names]) || [];
  const rows = (extract.data) ? data[extract.data] : data;

  if (!Array.isArray(rows)) {
    callback(rows);
    return;
  }

  for (let row of rows) {
    let construct = {};

    if (!extract.names)
      construct = row;
    else
      for (let f = 0; f < names.length; f++) {
        let name = names[f];
        construct[name] = row[f] || null;
      }

    if (callback)
      callback(construct);
  }
};
