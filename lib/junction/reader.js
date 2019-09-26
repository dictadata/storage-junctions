"use strict";

const { Readable } = require('stream');
const StorageError = require("../storage_error");

module.exports = class StorageReader extends Readable {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    if (!storageJunction.hasOwnProperty("_engram"))
      throw new StorageError({statusCode: 400}, "Invalid parameter: storageJunction");

    let streamOptions = {
      objectMode: true,
      highWaterMark: 64
    };
    super(streamOptions);

    this._junction = storageJunction;
    this._engram = storageJunction._engram;
    this._options = options || {};
    this._logger = this._options.logger || storageJunction._logger;
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(size) {
    console.log('StorageReader _read');
    throw new StorageError({statusCode: 501}, "method not implemented");
  }

};
