"use strict";

const StorageWriter = require('../junction/writer');

module.exports = class EchoWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

  }

  _write(construct, encoding, callback) {
    console.log("EchoWriter _write");

    try {
      // save construct to .schema
      console.log(construct);
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new Error('Error storing construct'));
    }

    callback();
  }

  _writev(chunks, callback) {
    console.log("EchoWriter _writev");

    for (var i = 0; i < chunks.length; i++) {
      let construct = chunks[i].chunk;
      let encoding = chunks[i].encoding;

      try {
        // save construct to .schema
        console.log(construct);
        console.log(encoding);
      }
      catch(err) {
        this._logger.error(err.message);
        callback(new Error('Error storing construct'));
      }
    }

    callback();
  }

  _final(callback) {
    console.log("EchoWriter _final");

    try {
      // close connection, cleanup resources, ...
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new Error('Error storing construct'));
    }
    callback();
  }

};
