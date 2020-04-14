"use strict";

const { Readable } = require('stream');
const {StorageError} = require("../types");
const logger = require('../logger');

module.exports = exports = class StorageReader extends Readable {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    if (!Object.prototype.hasOwnProperty.call(storageJunction, "engram"))
      throw new StorageError({statusCode: 400}, "Invalid parameter: storageJunction");

    let streamOptions = {
      objectMode: true,
      highWaterMark: 128,
      autoDestroy: false
    };
    super(streamOptions);

    this.junction = storageJunction;
    this.smt = storageJunction.smt;
    this.engram = storageJunction.engram;

    this.options = Object.assign({}, storageJunction.options.reader, options);

    // Set Capabilities of the StorageReader

    // useTransforms
    // derived classes should declare useTransforms=true if
    //    the data source doesn't support queries
    // then base StorageJunction.getReader function create a pipeline and
    //   use FilterTransform for options.match
    //   use SelectTransform for options.cues.fields
    //this.useTransforms = true;
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(size) {
    logger.debug('StorageReader _read');
    throw new StorageError({statusCode: 501}, "StorageReader._read method not implemented");
  }

};
