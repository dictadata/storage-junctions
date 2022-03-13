/**
 * rest/encoder
 *
 * Functions that handle the conversion of types
 * and queries between the junction and the source library.
 *
 */
"use strict";

const ynBoolean = require('yn');
const hasOwnProperty = require('../../utils/hasOwnProperty');

/**
 * convert a REST type to a storage field type
 *
 * Implementors notes:
 *   replace srcType values with actual source types
 */
var storageType = exports.storageType = function (srcType) {

  let fldType = 'unknown';

  switch (srcType.toUpperCase()) {
    default:
      fldType = 'unknown';
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
    switch (field.type.toLowerCase()) {
      default:
        srcType = "unknown";
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
};

exports.parseData = function (data, options, callback) {
  if (typeof data !== 'object')
    throw new Error("invalid json data");

  const constructs = (options.extract && data[ options.extract ]) || data;

  if (!Array.isArray(constructs)) {
    callback(constructs);
    return;
  }

  for (let construct of constructs) {
    if (callback)
      callback(construct);
  }
};

/*
exports.parseData = function (data, options, callback) {
  if (typeof data !== 'object')
    throw new Error("invalid json data");

  const extract = options.extract || {};
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
*/
