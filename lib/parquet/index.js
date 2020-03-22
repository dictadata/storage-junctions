/**
 * ParquetJunction
 */
"use strict";

const StorageJunction = require("../junction");
const { StorageResults, StorageError } = require("../types");
const logger = require('../logger');
const Cortex = require('../cortex');
const ParquetReader = require("./reader");
const ParquetWriter = require("./writer");

const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

module.exports = exports = class ParquetJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'parquet|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options = null) {
    logger.debug("ParquetJunction");
    super(SMT, options);

    this._readerClass = ParquetReader;
    this._writerClass = ParquetWriter;
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEncoding() {

    try {
      if (!this.engram.defined) {
        // read file to infer data types
        // default to 1000 constructs unless overridden in options
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
   * @param {*} construct
   * @param {*} options
   */
  async scan(options=null) {
    this.logger.verbose('junction scan');
    let fst = Cortex.activateFS(this.engram.smt, options || this.options.scan || {});
    return fst.scan();
  }


  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern=null) {
    logger.debug("ParquetJunction store");
    throw new StorageError({ statusCode: 501 }, "Not implemented: ParquetJunction store");
  }

  /**
   *
   */
  async recall(pattern=null) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: ParquetJunction recall");
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern=null) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: ParquetJunction retrieve");
  }

  /**
   *
   */
  async dull(pattern=null) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: ParquetJunction dull");
  }

};
