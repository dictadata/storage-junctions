/**
 * rest/encoder
 *
 * Functions that handle the conversion of types
 * and queries between the junction and the source library.
 *
 */
"use strict";

const StorageEncoder = require('../storage-junction/storage-encoder');
const { typeOf, dot } = require('../../utils');

module.exports = exports = class RestEncoder extends StorageEncoder {

  constructor(storageJunction, options) {
    super(storageJunction, options);
  }

  parseData(data, options, callback) {
    if (typeof data !== 'object')
      throw new StorageError("invalid json data");

    data = (options.pick && dot.get(options.pick, data)) || data;

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
    if (options.header) {
      // assume data is an array of arrays

      // check if options.header is array with field names
      let headers = options.headers || (Array.isArray(options.header) ? options.header : null);

      for (let arr of data) {
        if (!headers)
          // assume first array is header with field names
          headers = arr;
        else {
          // convert array to object
          let construct = {};
          for (let i = 0; i < headers.length; i++) {
            if (i >= arr.length)
              break;
            construct[ headers[ i ] ] = arr[ i ];
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
