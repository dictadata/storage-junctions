"use strict";

const StorageWriter = require('../junction/writer');
const Types = require("../types");
const StorageError = Types.StorageError;
const logger = require('../logger');

const fs = require('fs');
const fsp = fs.promises;


module.exports = class JsonWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    this.filename = this._options.filename || this._junction.filename || '';
    this.fd = null;
    this.first = true;
  }

  async _write(construct, encoding, callback) {
    logger.debug("StorageWriter _write");

    try {
      // save construct to .schema
      //this._junction.store(construct);  // not sure if this would be better

      // check if file is open
      if (this.fd === null) {
        let flags = this._options.append ? 'a' : 'w';
        this.fd = await fsp.open(this.filename, flags);

        // write header line
        let header = "[\n";
        await this.fd.write(header);
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
        await this._write(construct, encoding, () => { });
      }

      callback();
    }
    catch (err) {
      this._logger.error(err.message);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
    }

  }

  async _final(callback) {

    try {
      // write footer line
      let footer = "\n]";
      await this.fd.write(footer);

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
