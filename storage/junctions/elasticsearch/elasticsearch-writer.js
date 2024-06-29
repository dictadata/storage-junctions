/**
 * elasticsearch/writer
 */
"use strict";

const { StorageWriter } = require('../storage-junction');
const { StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');

module.exports = exports = class ElasticsearchWriter extends StorageWriter {

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

  async _construct(callback) {
    logger.debug("ElasticsearchWriter._construct");

    try {
      // open output stream

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) || new StorageError('ElasticsearchWriter construct error'));
    }
  }

  async _write(construct, encoding, callback) {
    logger.debug("ElasticsearchWriter._write");
    //logger.debug(JSON.stringify(construct));
    // check for empty construct
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }

    try {
      // save construct to .schema
      this._stats.count += 1;
      let response = await this.junction.store(construct);
      logger.debug("status: " + JSON.stringify(response));
      callback();
    }
    catch (err) {
      callback(err);
    }

  }

  async _writev(chunks, callback) {
    logger.debug("ElasticsearchWriter._writev");

    try {
      this._stats.count += chunks.length;

      let response;
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[ i ].chunk;
        let encoding = chunks[ i ].encoding;

        // save construct to .schema
        response = await this.junction.store(construct);
        if (response.status !== 0)
          break;

        // logger.verbose("status: " + JSON.stringify(response));
      }

      callback();
    }
    catch (err) {
      callback(err);
    }
  }

  async _final(callback) {
    logger.debug('ElasticsearchWriter._final');
    try {
      callback();
    }
    catch (err) {
      callback(err);
    }
  }

};
