/**
 * storage/transforms/mapConstructs.js
 */
"use strict";

const { Transform } = require('stream');

/**
 * Transforms map (object map) data to construct objects.
 */
module.exports = exports = class MapConstructsTransform extends Transform {

  /**
   *
   *
   * @param {Object} options
   * @param {Array} options.key_name
   */
  constructor(options = {}) {
    let streamOptions = {
      writableObjectMode: true,
      readableObjectMode: true
    };
    super(streamOptions);

    this.options = Object.assign({ key_name: "_key" }, options);
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} map
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(map, encoding, callback) {

    for (let [ name, construct ] of Object.entries(map)) {
      construct[ this.options.key_name ] = name;
      this.push(construct);
    }

    callback();
  }

  _flush(callback) {
    callback();
  }
};
