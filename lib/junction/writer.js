"use strict";

const { Writable } = require('stream');
const {StorageError} = require("../types");

module.exports = class StorageWriter extends Writable {

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

  async _write(construct, encoding, callback) {
    console.log("StorageWriter _write");

    try {
      await this._junction.store(construct);
      callback();
    }
    catch (err) {
      console.log(err.message);
      callback(err);
    }
  }

  async _writev(chunks, callback) {
    console.log("StorageWriter _writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        //let encoding = chunks[i].encoding;  // string encoding

        // save construct to .schema
        await this._junction.store(construct);
      }
      callback();
    }
    catch (err) {
      this._logger.error(err.message);
      callback(err);
    }
  }

  _final(callback) {
    console.log('StorageWriter _final');
    callback();
  }

};
