"use strict";

const StorageWriter = require('../junction/writer');
const Types = require("../types");
const StorageError = Types.StorageError;
const logger = require('../logger');

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

module.exports = class CsvWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    this.ws = null;
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
      this.ws = fs.createWriteStream(filename, {flags: flags});
    }
    return newFile;
  }

  /**
   * _write
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
      if (!this.ws) {
        if (this.createWriteStream()) {
          // new file, write header line
          let keys = Object.keys(construct);
          let headers = keys.join(',') + "\n";
          await this.ws.write(headers);
        }
      }

      // create data line
      var data = '';
      var first = true;
      for (let [name, field] of Object.entries(this._engram.fields)) {
        if (first)
          first = false;
        else
          data += ',';

        let value = construct[name];
        if (value !== null) {
          switch (field.type) {
            case "boolean":
              data += value ? "true" : "false";
              break;
            case "date":
              data += Types.formatDate(value);
              break;
            case "float":
            case "integer":
            case "keyword":
              data += value;
              break;
            case "text":
              data += '"' + value + '"';
              break;
          }
        }
      }

      // write data line
      if (data.length > 0) {
        data += "\n";
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
   * _writev
   * @param {*} chunks
   * @param {*} callback
   */
  async _writev(chunks, callback) {
    logger.debug("StorageWriter _writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        let encoding = chunks[i].encoding;

        // save construct to .schema
        await this._write(construct,encoding, () => {});
      }

      callback();
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error storing construct'));
    }

  }

  /**
   * _final
   * @param {*} callback
   */
  async _final(callback) {

    try {
      // close connection, cleanup resources, ...
      if (this.ws !== null)
        await this.ws.end();

      callback();
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error _final'));
    }
  }

};
