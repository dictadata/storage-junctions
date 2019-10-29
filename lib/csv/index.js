/**
 * CsvJunction
 */
"use strict";

const StorageJunction = require("../junction");
const { StorageResults, StorageError } = require("../types");
const logger = require('../logger');
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
    logger.debug("CsvJunction");
    super(SMT, options);

    this._readerClass = CsvReader;
    this._writerClass = CsvWriter;
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
 * @param {*} options
 */
  async scan(options) {
    logger.verbose('junction scan');
    return scanner(this._engram.smt, options);
  }


  /**
   *
   * @param {*} construct
   */
  async store(construct, options=null) {
    logger.debug("CsvJunction store");
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
