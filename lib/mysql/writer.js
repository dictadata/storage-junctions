/**
 * mysql/writer
 */
"use strict";

const StorageWriter = require('../junction/writer');
const encoder = require('./encoder');

const mysql = require('mysql');
const util = require('util');

module.exports = class MySQLWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

  }

  async _write(construct, encoding, callback) {
    console.log("mysql _write");
    //console.log(construct);

    try {
      // save construct to .schema
      await this._junction.store(construct);

      callback();
    }
    catch (err) {
      this._logger.error(err.message);
      callback(err);
    }

  }

  async _writev(chunks, callback) {
    //console.log("MySQLWriter _writev");

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
