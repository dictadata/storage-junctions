"use strict";

const StorageWriter = require('../junction/writer');

module.exports = class ElasticsearcWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    this.options = {
      node: this._encoding.location,
      index: this._encoding.container
    };

    this.elastic = storageJunction.elastic;
  }

  _write(construct, encoding, callback) {
    //console.log("ElasticsearchWriter _write");
    //console.log(construct);

    try {
      // save construct to container
      this._junction.store(construct);

      callback();
    }
    catch (err) {
      this._logger.error(err.message);
      callback(err);
    }

  }

  _writev(chunks, callback) {
    //console.log("ElasticsearchWriter _writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        //let encoding = chunks[i].encoding;  // string encoding

        // save construct to container
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
    //console.log('ElasticsearchWriter _final');
    callback();
  }

};
