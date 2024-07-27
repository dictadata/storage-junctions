/**
 * rest/encoder
 *
 * Functions that handle the conversion of types
 * and queries between the junction and the source library.
 *
 */
"use strict";

const StorageEncoder = require('../storage-junction/storage-encoder');
const { typeOf, dot } = require('@dictadata/lib');

module.exports = exports = class RestEncoder extends StorageEncoder {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   * @param {boolean}  options.hasHeader input includes a header row, default false
   * @param {string[]} options.headers values to use for field names, default undefined
   * @param {string}   options.pick property name to pick from source object(s)
   * @param {number}   options.count maximum number of rows to read, default all
   * @param {string}   options.fileEncoding  default "utf8"
   * @param {boolean}  options.raw output raw data as arrays
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this._headers;

  }

  parseData(data, options, callback) {
    if (typeof data !== 'object')
      throw new StorageError("invalid json data");

    data = (options.pick && dot.get(data, options.pick)) || data;

    if (typeOf(data) === "object") {
      if (options.objects) {
        // data is multiple objects
        for (const construct of Object.values(data))
          callback(construct);
      }
      else
        callback(data);  // data is a single object
    }

    if (options.raw) {
      if (Array.isArray(data) && data.length && typeof data[ 0 ] === "object") {
        for (const construct of data)
          callback(construct);
      }
      else
        callback(data);
    }
    else if (Array.isArray(data) && data.length && typeof data[ 0 ] === "object") {
      for (let row of data) {
        let construct;

        if (!Array.isArray(row)) {
          construct = row;
        }
        else {
          // check if first row is header row
          if (options.hasHeader && !this._headers) {
            this._headers = row;
            if (!options.headers)
              options.headers = row;
          }
          else if (options.headers) {
            construct = {};
            // convert row to object
            for (let i = 0; i < row.length; i++) {
              let name = options.headers[ i ] || i;
              construct[ name ] = row[ i ];
            }
          }
        }

        if (construct)
          callback(construct);
      }
    }
    else {
      callback(data);
    }
  }

};
