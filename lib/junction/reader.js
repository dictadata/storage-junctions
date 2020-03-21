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
  constructor(storageJunction, options = null) {
    if (!Object.prototype.hasOwnProperty.call(storageJunction, "_engram"))
      throw new StorageError({statusCode: 400}, "Invalid parameter: storageJunction");

    let streamOptions = {
      objectMode: true,
      highWaterMark: 128
    };
    super(streamOptions);

    this._junction = storageJunction;
    this._engram = storageJunction._engram;
    this._logger = storageJunction._logger || logger;

    this._options = Object.assign({}, storageJunction._options.reader, options);
  }

  ifOptions(dst, names) {
    if (!Array.isArray(names))
      names = [names];

    for (let name of names)
      if (Object.prototype.hasOwnProperty.call(this._options, name))
        dst[name] = this._options[name];
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(size) {
    this._logger.debug('StorageReader _read');
    throw new StorageError({statusCode: 501}, "method not implemented");
  }

};
