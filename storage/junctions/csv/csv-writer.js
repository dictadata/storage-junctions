"use strict";

const { StorageWriter } = require('../storage-junction');
const { StorageError } = require("../../types");
const { logger } = require("@dictadata/lib");;
const { formatDate } = require("@dictadata/lib/utils");


module.exports = exports = class CSVWriter extends StorageWriter {

  /**
   *
   * @param {object}   junction parent CSVJunction
   * @param {object}   options
   * @param {boolean}  options.header output includes a header row, default false
   * @param {string[]} options.headers values to use for engram field names, default undefined
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    // check schema's extension
    //if (this.options.schema && path.extname(this.options.schema) === '')
    //  this.options.schema = this.options.schema + '.csv';

    // this.options.header = false;  // default value

    this.ws = null;
  }

  async _construct(callback) {
    logger.debug("CSVWriter._construct");

    try {
      // open output stream
      this.stfs = await this.junction.getFileSystem();
      this.ws = await this.stfs.createWriteStream(this.options);

      this.ws.on('error',
        (err) => {
          this.destroy(this.stfs?.StorageError(err) ?? new StorageError(err));
        });

      if (this.stfs.isNewFile && this.options.header) {
        // new file, write header line
        let names = this.options.headers || this.engram.names;
        let headers = '"' + names.join('","') + '"\n';
        await this.ws.write(headers);
      }

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) || new StorageError('CsvWriter construct error'));
    }
  }

  /**
   * _write
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  async _write(construct, encoding, callback) {
    logger.debug("CSVWriter._write");

    // check for empty construct
    //logger.debug(JSON.stringify(construct));
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }

    try {
      // save construct to .schema
      //this.junction.store(construct);  // not sure if this would be better

        // create data line
      var data = '';
      var first = true;
      for (let field of this.engram.fields) {
        (first) ? first = false : data += ',';

        let value = construct[ field.name ];
        if (typeof value === "undefined" || value === null) {
          if (field.hasDefault && field.default !== null)
            data += field.default;
          //else
          //  leave value empty e.g. "a,,c"
        }
        else {
          switch (field.type.toLowerCase()) {
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
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) ?? new StorageError(err), 'CSVWriter write error ');
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
        let construct = chunks[ i ].chunk;
        let encoding = chunks[ i ].encoding;

        // save construct to .schema
        await this._write(construct, encoding, () => { });
      }
      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) ?? new StorageError(err));
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
        if (this.autoClose) {
          await new Promise((resolve) => {
            this.ws.end(resolve);
          });
        }

        if (this.ws.fs_ws_promise)
          await this.ws.fs_ws_promise;
      }

      this._count(null);
      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) ?? new StorageError(err));
    }
  }

};
