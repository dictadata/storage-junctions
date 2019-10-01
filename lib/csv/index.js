/**
 * CsvJunction
 */
"use strict";

const StorageJunction = require("../junction");
const CsvReader = require("./reader");
const CsvWriter = require("./writer");
const {StorageResults, StorageError} = require("../types");

const stream = require('stream');
const util = require('util');
const path = require('path');

const pipeline = util.promisify(stream.pipeline);

module.exports = class CsvJunction extends StorageJunction {

  /**
   *
   * @param {*} storagePath 'csv|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(storagePath, options = null) {
    //console.log("CsvJunction");
    super(storagePath, options);

    this._readerClass = CsvReader;
    this._writerClass = CsvWriter;

    this.filename = this._options.filename || path.join(this._engram.location, this._engram.schema) || '';
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEncoding() {

    try {
      if (!this.active) {
        // read the file to infer data types
        // default to 1000 constructs unless overridden in options
        let reader = this.getReadStream( Object.assign({codify: true, max_read: 1000}, this._options) );
        let codify = this.getCodifyTransform();

        await pipeline(reader, codify);
        let encoding = await codify.getEncoding();
        this._engram.merge(encoding);
      }
      return this._engram;
    }
    catch(err) {
      this._logger.error(err.message);
    }
  }

  /**
   * Sets the encoding for the storage node.
   * @param {*} encoding
   */
  async putEncoding(encoding) {
    try {
      this._engram.merge(encoding);
      return this._engram || false;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, options=null) {
    //console.log("CsvJunction store");
    throw new StorageError({statusCode: 501}, "Not implemented: CsvJunction store");
  }

  /**
   *
   */
  async recall(options = null) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: CsvJunction recall");
  }

  /**
   *
   * @param {*} options options.pattern
   */
  async retrieve(options = null) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: CsvJunction retrieve");
  }

  /**
   *
   */
  async dull(options = null) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: CsvJunction dull");
  }

};
