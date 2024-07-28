/**
 * storage/transforms/mapToConstructs.js
 */
"use strict";

const { Transform } = require('node:stream');

/**
 * Transforms an object or Map of entries to constructs.
 */
module.exports = exports = class MapToConstructsTransform extends Transform {

  /**
   *
   *
   * @param {object} options
   * @param {Array} options.key_name
   */
  constructor(options = {}) {
    let streamOptions = {
      objectMode: true
    };
    super(streamOptions);

    this.key = Object.hasOwn(options, "key") ? options.key : "_key";
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} map
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(map, encoding, callback) {

    let entries;
    if (map instanceof Map)
      entries = map.entries;
    else
      entries = Object.entries(map);

    for (let [ name, construct ] of entries) {
      if (this.key)
        construct[ this.key ] = name;

      this.push(construct);
    }

    callback();
  }

  /*
    _flush(callback) {
      logger.debug("transform _flush");

      // push some final object(s)
      //this.push(this._composition);

      callback();
    }
  */
};
