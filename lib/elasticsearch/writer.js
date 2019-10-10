/**
 * elasticsearch/writer
 */
"use strict";

const StorageWriter = require('../junction/writer');
const logger = require('../logger');

module.exports = class ElasticsearcWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    this.options = {
      node: this._engram.smt.locus,
      index: this._engram.smt.schema
    };

  }

  _write(construct, encoding, callback) {
    logger.debug("ElasticsearchWriter _write");
    logger.debug(construct);

    try {
      // save construct to .schema
      this._junction.store(construct);

      callback();
    }
    catch (err) {
      this._logger.error(err.message);
      callback(err);
    }

  }

  _writev(chunks, callback) {
    logger.debug("ElasticsearchWriter _writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        //let encoding = chunks[i].encoding;  // string encoding

        // save construct to .schema
        this._junction.store(construct);
      }
      callback();
    }
    catch (err) {
      this._logger.error(err.message);
      callback(err);
    }
  }

  _final(callback) {
    logger.debug('ElasticsearchWriter _final');
    callback();
  }

};
