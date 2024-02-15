/**
 * splitter/writer
 */
"use strict";

const { StorageWriter } = require('../storage-junction');
const { StorageError } = require("../../types");
const { logger } = require("../../utils");

module.exports = exports = class SplitterWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

  }

  async _write(construct, encoding, callback) {
    logger.debug("SplitterWriter._write");
    //logger.debug(JSON.stringify(construct));
    // check for empty construct
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }

    try {
      // value to splitOn
      let sname = construct[this.options.splitOn];

      // get storage junction for splitter field(s)
      let wstream = await this.junction.getTractStream(sname);

      // store
      this._count(1);
      await wstream.write(construct);
      callback();
    }
    catch (err) {
      logger.warn(err);
      callback(err);
    }

  }

  async _writev(chunks, callback) {
    logger.debug("SplitterWriter._writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        let encoding = chunks[i].encoding;

        // save construct to .schema
        await this._write(construct, encoding, () => {});
      }
      callback();
    }
    catch (err) {
      logger.warn(err);
      callback(new StorageError(500, 'Error storing construct').inner(err));
    }
  }

  async _final(callback) {
    logger.debug("SplitterWriter._final");

    try {
      // close connection, cleanup resources, ...
      this.junction.endTractStream();
      this._count(null);
      callback();
    }
    catch (err) {
      logger.warn(err);
      callback(new StorageError(500, 'Error storing construct').inner(err));
    }
  }

};
