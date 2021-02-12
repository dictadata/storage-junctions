/**
 * elasticsearch/writer
 */
"use strict";

const StorageWriter = require('../storage-junction/writer');
const logger = require('../logger');

module.exports = exports = class ElasticsearcWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this.options = {
      node: this.engram.smt.locus,
      index: this.engram.smt.schema
    };

  }

  async _write(construct, encoding, callback) {
    logger.debug("ElasticsearchWriter._write");
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
    logger.debug("ElasticsearchWriter._writev");

    try {
      this._count(chunks.length);

      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        let encoding = chunks[i].encoding;

        // save construct to .schema
        await this.junction.store(construct);
      }
      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
    }
  }

  async _final(callback) {
    logger.debug('ElasticsearchWriter._final');
    try {
      this._count(null);
      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error writer._final'));
    }
  }

};
