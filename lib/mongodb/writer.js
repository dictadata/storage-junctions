"use strict";

const StorageWriter = require('../junction/writer');
//const MongoDB = require('mongodb');

module.exports = class MongoDBWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

  }



  _write(construct, encoding, callback) {
    console.log("_write");

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
    for (var i = 0; i < chunks.length; i++) {
      let construct = chunks[i].chunk;
      //let encoding = chunks[i].encoding;

      try {
        // save construct to .schema
        console.log(construct);
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

};
