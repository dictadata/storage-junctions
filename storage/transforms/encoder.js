"use strict";

/**
 * Transform a storage source schema definitions
 * into storage field encodings.
 */

const cortex = require("../cortex");
const { StorageError } = require("../types");
const { hasOwnProperty, logger } = require("../utils");

const { Transform } = require('stream');

// example encoder transform
/*
  transform: {
    "encoder": {
      "junction": "mysql"
    }
  };
*/

module.exports = exports = class EncoderTransform extends Transform {

  /**
   *
   * @param {*} options transform options
   */
  constructor(options) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 128
    };
    super(streamOptions);

    this.options = Object.assign({}, options);

    if (!hasOwnProperty(options, "junction"))
      throw new StorageError( 400, "options.junction not defined");

    let junction = cortex._storageJunctions.get(options.junction);
    if (junction)
      if (hasOwnProperty(junction, "encoder"))
        this.encoder = junction.encoder;
      else
        throw new StorageError(400, "Junction does not have encoder " + options.junction);
    else
      throw new StorageError( 404, "Junction not found " + options.junction);
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(construct, encoding, callback) {

    // should do some checks to validate construct

    // encode the column
    let field = this.encoder.storageField(construct);
    this.push(field);

    callback();
  }

  async _flush(callback) {
    logger.debug("encoder _flush");

    // push some final object(s)
    this.push(this._composition);

    callback();
  }

    async _final(callback) {
    logger.debug("encoder _final");

    // push some final object(s)
    //this.push(this._composition);

    callback();
  }
};
