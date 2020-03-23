/**
 * elasticsearch/writer
 */
"use strict";

const StorageWriter = require('../junction/writer');
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
    logger.debug("ElasticsearchWriter _write");
    logger.debug(JSON.stringify(construct));

    try {
      // save construct to .schema
      await this.junction.store(construct);

      callback();
    }
    catch (err) {
      this.logger.error(err.message);
      callback(err);
    }

  }

  async _writev(chunks, callback) {
    logger.debug("ElasticsearchWriter _writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        //let encoding = chunks[i].encoding;  // string encoding

        // save construct to .schema
        await this.junction.store(construct);
      }
      callback();
    }
    catch (err) {
      this.logger.error(err.message);
      callback(err);
    }
  }

  async _final(callback) {
    logger.debug('ElasticsearchWriter _final');
    callback();
  }

};
