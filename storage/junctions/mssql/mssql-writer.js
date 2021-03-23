/**
 * mssql/writer
 */
"use strict";

const { StorageWriter } = require('../storage');
const { StorageError } = require("../types");
const logger = require('../logger');


module.exports = exports = class MSSQLWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

  }

  async _write(construct, encoding, callback) {
    logger.debug("MSSQLWriter._write");
    logger.debug(JSON.stringify(construct));
    // check for empty construct
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }

    try {
      // save construct to .schema
      this._count(1);
      await this.junction.store(construct);

      callback();
    }
    catch (err) {
      logger.error(err);
      callback(err);
    }

  }

  async _writev(chunks, callback) {
    logger.debug("MSSQLWriter._writev");

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
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
    }
  }

  async _final(callback) {
    logger.debug("MSSQLWriter._final");

    try {
      // close connection, cleanup resources, ...
      this._count(null);
      callback();      
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error writer._final'));
    }
  }

};
