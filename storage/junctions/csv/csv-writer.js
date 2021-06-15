"use strict";

const { StorageWriter } = require('../storage-junction');
const { StorageError } = require("../../types");
const { formatDate, logger } = require("../../utils");

const path = require('path');


module.exports = exports = class CSVWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    // check schema's extension
    if (this.options.schema && path.extname(this.options.schema) === '')
      this.options.schema = this.options.schema + '.csv';

    // this.options.header = false;  // default value

    this.ws = null;
  }

  /**
   * _write
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  async _write(construct, encoding, callback) {
    logger.debug("CSVWriter._write");
    //logger.debug(JSON.stringify(construct));    
    // check for empty construct
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }

    try {
      // save construct to .schema
      //this.junction.store(construct);  // not sure if this would be better

      // check if file is open
      if (!this.ws) {
        let stfs = await this.junction.getFileSystem();
        this.ws = await stfs.createWriteStream(this.options);
        if (stfs._isNewFile && this.options.header) {
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
        (first) ? first = false : data += ',';

        let value = construct[name];
        if ((typeof value === "undefined" || value === null) && field.defaultValue)
          value = field.defaultValue;

        if (typeof value !== "undefined" && value !== null) {
          switch (field.type) {
            case "boolean":
              data += value ? "true" : "false";
              break;
            case "date":
              data += formatDate(value);
              break;
            case "number":
            case "integer":
            case "keyword":
              data += value;
              break;
            case "string":
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
        this._count(1);
        await this.ws.write(data);
      }

      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError(500, 'Error storing construct').inner(err));
    }
  }

  /**
   * _writev
   * @param {*} chunks
   * @param {*} callback
   */
  async _writev(chunks, callback) {
    logger.debug("CSVWriter._writev");

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
      logger.error(err);
      callback(new StorageError(500, 'Error storing construct').inner(err));
    }
  }

  /**
   * _final
   * @param {*} callback
   */
  async _final(callback) {
    logger.debug("CSVWriter._final");

    try {
      if (this.ws) {
        await this.ws.end();

        if (this.ws.fs_ws_promise)
          await this.ws.fs_ws_promise;
        else
          await new Promise((fulfill) => this.ws.on("finish", fulfill));
      }
      this._count(null);
      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError(500, 'Error writer._final').inner(err));
    }
  }

};
