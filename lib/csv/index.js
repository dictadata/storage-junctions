/**
 * CsvJunction
 */
"use strict";

const StorageJunction = require("../junction");
const { StorageResults, StorageError } = require("../types");
const scanner = require('../lib/folderScanner');
const CsvReader = require("./reader");
const CsvWriter = require("./writer");

const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

module.exports = class CsvJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'csv|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options = null) {
    super(SMT, options);
    this._logger.debug("CsvJunction");

    this._readerClass = CsvReader;
    this._writerClass = CsvWriter;
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEncoding() {

    try {
      if (!this._engram.defined) {
        // read the file to infer data types
        // default to 1000 constructs unless overridden in options
        let reader = this.getReadStream(this._options.reader || { max_read: 100 });
        let codify = this.getCodifyWriter(this._options.codify || {});
        await pipeline(reader, codify);

        let encoding = await codify.getEncoding();
        this._engram.replace(encoding);
      }
      return this._engram;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   * Sets the encoding for the storage node.
   * @param {*} encoding
   */
  async putEncoding(encoding) {
    try {
      this._engram.replace(encoding);
      return this._engram || false;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
 * Scan the locus for schemas.
 * The smt.schema must contain a wildcard character *.
 * If options.forEach is defined it is called for each schema found.
 * Returns list of schemas found.
 * @param {*} construct
 * @param {*} scanOptions
 */
  async scan(options=null) {
    this._logger.verbose('junction scan');
    return scanner(this, options || this._options.scan || {});
  }


  /**
   *
   * @param {*} construct
   */
  async store(construct, options=null) {
    this._logger.debug("CsvJunction store");
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
