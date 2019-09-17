"use strict";

const StorageWriter = require('../junction/writer');
//const axios = require('axois');

module.exports = class RestWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    // update engram
    //this._encoding.location = ;
    //this._encoding.container = ;
    this._encoding.key = '*';
  }



  _write(chunk, encoding, callback) {
    console.log("_write");

    try {
      // save construct to container
      console.log(chunk);
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new Error('Error storing construct'));
    }

    callback();
  }

  _writev(chunks, callback) {
    for (var i = 0; i < chunks.length; i++) {
      let chunk = chunks[i].chunk;
      let encoding = chunks[i].encoding;

      try {
        // save construct to container
      }
      catch(err) {
        this._logger.error(err.message);
        callback(new Error('Error storing construct'));
      }
    }

    callback();
  }

  _final(callback) {

    try {
      // close connection, cleanup resources, ...
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new Error('Error storing construct'));
    }
    callback();
  }

}
