/**
 * mysql/writer
 */
"use strict";

const { StorageWriter } = require('../storage-junction');
const { StorageError } = require("../../types");
const { logger } = require('../../utils');


module.exports = exports = class MySQLWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

  }

  async _construct(callback) {
    logger.debug("MySQLWriter._construct");

    try {
      // open output stream

      callback();
    }
    catch (err) {
      logger.warn("MySQLWriter: " + (err.code || err.message));
      callback(this.stfs?.Error(err) || new Error('MySQLWriter construct error'));
    }
  }

  async _write(construct, encoding, callback) {
    logger.debug("MySQLWriter._write");
    //logger.debug(JSON.stringify(construct));
    // check for empty construct
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }

    try {
      // save construct to .schema
      this._count(1)
      await this.junction.store(construct);
      callback();
    }
    catch (err) {
      logger.warn("MySQLWriter: " + (err.code || err.message));
      callback(err);
    }

  }

  async _writev(chunks, callback) {
    logger.debug("MySQLWriter._writev");

    try {
      this._count(chunks.length);
      let constructs = [];
      for (var i = 0; i < chunks.length; i++) {
        if (this.options.bulkLoad) {
          constructs.push(chunks[i].chunk);
        }
        else {
          let construct = chunks[i].chunk;
          //let encoding = chunks[i].encoding;
          // save construct to .schema
          await this.junction.store(construct);
        }
      }
      if (this.options.bulkLoad)
        await this.junction.storeBulk(constructs);

      callback();
    }
    catch (err) {
      logger.warn("MySQLWriter: " + (err.code || err.message));
      callback(new StorageError(500, 'Error storing construct').inner(err));
    }
  }

  async _final(callback) {
    logger.debug("MySQLWriter._final");

    try {
      // close connection, cleanup resources, ...
      this._count(null);
      callback();
    }
    catch (err) {
      logger.warn("MySQLWriter: " + (err.code || err.message));
      callback(new StorageError(500, 'Error writer._final').inner(err));
    }
  }

};
