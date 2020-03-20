"use strict";

const StorageWriter = require('../junction/writer');
const Types = require("../types");
const StorageError = Types.StorageError;
const logger = require('../logger');

const fileStreams = require('../filesystems/fileStreams');

module.exports = class ParquetWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    this.ws = null;
    this.count = 0;
  }

  /**
   *
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  async _write(construct, encoding, callback) {
    //logger.debug("StorageWriter _write");

    try {
      // save construct to .schema

      // check if file is open
      if (this.ws === null) {
        this.ws = await fileStreams.createWriteStream(this._engram.smt, this._options);
        // write opening, if any
        await this.ws.write(this.open);
      }

      let data = (this.count === 0) ? "" : this.delim;

      data += JSON.stringify(construct);
      if (data.length > 0) {
        await this.ws.write(data);
      }

      this.count++;
      callback();
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error storing construct'));
    }

  }

  /**
   *
   * @param {*} chunks
   * @param {*} callback
   */
  async _writev(chunks, callback) {
    logger.debug("StorageWriter _writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        let encoding = chunks[i].encoding;

        // save construct to schema
        await this._write(construct, encoding, () => {});
      }

      callback();
    }
    catch (err) {
      this._logger.error(err.message);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
    }

  }

  /**
   *  close connection, cleanup resources, ...
   * @param {*} callback
   */
  async _final(callback) {

    try {
      if (this.ws) {
      // write footer line
        await this.ws.end(this.close);

        if (this.ws.s3upload)
          await this.ws.s3upload;
        else
          await new Promise((fulfill) => this.ws.on("finish", fulfill));
      }
      callback();
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error _final'));
    }
  }

};
