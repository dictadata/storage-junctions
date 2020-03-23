/**
 * CsvJunction
 */
"use strict";

const StorageJunction = require("../junction");
const { StorageResults, StorageError } = require("../types");
const Cortex = require('../cortex');
const CsvReader = require("./reader");
const CsvWriter = require("./writer");

const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

module.exports = exports = class CsvJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'csv|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    this.logger.debug("CsvJunction");

    this._readerClass = CsvReader;
    this._writerClass = CsvWriter;
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEncoding() {

    try {
      if (!this.engram.defined) {
        // read the file to infer data types
        // default to 100 constructs unless overridden in options
        let reader = this.getReadStream(this.options.reader || { max_read: 100 });
        let codify = this.getCodifyWriter(this.options.codify || {});
        await pipeline(reader, codify);

        let encoding = await codify.getEncoding();
        this.engram.replace(encoding);
      }
      return this.engram;
    }
    catch(err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  /**
   * Sets the encoding for the storage node.
   * @param {*} encoding
   */
  async putEncoding(encoding) {
    try {
      this.engram.replace(encoding);
      return this.engram || false;
    }
    catch(err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  /**
  * Scan the locus for schemas.
  * The smt.schema must contain a wildcard character *.
  * If options.forEach is defined it is called for each schema found.
  * Returns list of schemas found.
  * @param {*} options - scan options
  */
  async scan(options) {
    this.logger.verbose('junction scan');
    let fst = await Cortex.activateFS(this.smt, this.options);
    let list = await fst.scan(options);
    Cortex.relax(fst);
    return list;
  }


  /**
   *
   * @param {*} construct
   * @param {*} pattern
   */
  async store(construct, pattern) {
    this.logger.debug("CsvJunction store");
    throw new StorageError({statusCode: 501}, "Not implemented: CsvJunction store");
  }

  /**
   *
   */
  async recall(pattern) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: CsvJunction recall");
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: CsvJunction retrieve");
  }

  /**
   *
   */
  async dull(pattern) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: CsvJunction dull");
  }

};
