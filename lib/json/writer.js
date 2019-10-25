"use strict";

const StorageWriter = require('../junction/writer');
const Types = require("../types");
const StorageError = Types.StorageError;
const logger = require('../logger');

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');


module.exports = class JsonWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    this.ws = null;
    this.first = true;
  }

  /**
  * createWriteStream
  */
  async createWriteStream() {
    let newFile = false;
    if (this._engram.smt.locus.indexOf('S3:') === 0 || this._engram.smt.locus.indexOf('s3:') === 0) {

      newFile = true;
    }
    else {
      // default to local file path or file: URL
      var filename = path.join(this._engram.smt.locus, this._engram.smt.schema) || '';
      newFile = !this._options.append || !await fsp.access(filename, fs.constants.R_OK | fs.constants.W_OK);

      let flags = this._options.append ? 'a' : 'w';
      this.ws = fs.createWriteStream(filename, { flags: flags });
    }
    return newFile;
  }

  /**
   *
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  async _write(construct, encoding, callback) {
    logger.debug("StorageWriter _write");

    try {
      // save construct to .schema
      //this._junction.store(construct);  // not sure if this would be better

      // check if file is open
      if (this.ws === null) {
        this.createWriteStream();

        // write header line
        let header = "[\n";
        await this.ws.write(header);
      }

      let data = "";
      if (this.first)
        this.first = false;
      else
        data = ",\n";

      // create data line
      data += JSON.stringify(construct);

      // write data line
      if (data.length > 0) {
        //data += "\n";
        await this.ws.write(data);
      }

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
      // write footer line
      if (this.ws !== null) {
        let footer = "\n]";
        await this.ws.end(footer);
      }

      callback();
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error _final'));
    }
  }

};
