"use strict";

const StorageWriter = require('../junction/writer');
const Types = require("../types");
const StorageError = Types.StorageError;
const logger = require('../logger');

const fs = require('fs');
const fsp = fs.promises;

module.exports = class CsvWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    this.filename = this._options.filename || this._junction.filename || '';
    this.fd = null;
  }

  async _write(construct, encoding, callback) {
    logger.debug("StorageWriter _write");

    try {
      // save construct to .schema
      //this._junction.store(construct);  // not sure if this would be better

      // check if file is open
      if (this.fd === null) {
        let newFile = !this._options.append || !await fsp.access(this.filename, fs.constants.R_OK | fs.constants.W_OK);

        let flags = this._options.append ? 'a' : 'w';
        this.fd = await fsp.open(this.filename, flags);

        // write header line
        if (newFile) {
          let keys = Object.keys(construct);
          let headers = keys.join(',') + "\n";
          await this.fd.write(headers);
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
        await this.fd.write(data);
      }

      callback();
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error storing construct'));
    }
  }

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

  async _final(callback) {

    try {
      // close connection, cleanup resources, ...
      if (this.fd !== null)
        await this.fd.close();

      callback();
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error _final'));
    }
  }

};
