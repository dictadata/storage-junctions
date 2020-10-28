"use strict";

const StorageWriter = require('../storage-junction/writer');
const Types = require("../types");
const StorageError = Types.StorageError;
const logger = require('../logger');

const Cortex = require('../cortex');

module.exports = exports = class CsvWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this.ws = null;
  }

  /**
   * _write
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  async _write(construct, encoding, callback) {
    logger.debug("CsvWriter _write");

    try {
      // save construct to .schema
      //this.junction.store(construct);  // not sure if this would be better

      // check if file is open
      if (!this.ws) {
        let stfs = await this.junction.getFileSystem();
        this.ws = await stfs.createWriteStream(this.options);
        if (stfs._isNewFile) {
          // new file, write header line
          let keys = Object.keys(this.engram.fields);
          let headers = '"' + keys.join('","') + '"\n';
          await this.ws.write(headers);
        }
      }

      // create data line
      var data = '';
      var first = true;
      for (let [name, field] of Object.entries(this.engram.fields)) {
        if (first)
          first = false;
        else
          data += ',';

        let value = construct[name];
        if ((typeof value === "undefined" || value === null) && field.default)
          value = field.default;

        if (typeof value !== "undefined" && value !== null) {
          switch (field.type) {
            case "boolean":
              data += value ? "true" : "false";
              break;
            case "date":
              data += Types.formatDate(value);
              break;
            case "number":
            case "integer":
            case "keyword":
              data += value;
              break;
            case "text":
              data += '"' + value + '"';
              break;
          }
        }
        // else leave value empty e.g. "a,,c"
      }

      // write data line
      if (data.length > 0) {
        data += "\n";
        await this.ws.write(data);
      }

      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
    }
  }

  /**
   * _writev
   * @param {*} chunks
   * @param {*} callback
   */
  async _writev(chunks, callback) {
    logger.debug("CsvWriter _writev");

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
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
    }

  }

  /**
   * _final
   * @param {*} callback
   */
  async _final(callback) {

    try {
      if (this.ws) {
        await this.ws.end();

        if (this.ws.fs_ws_promise)
          await this.ws.fs_ws_promise;
        else
          await new Promise((fulfill) => this.ws.on("finish", fulfill));
      }
      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error _final'));
    }
  }

};