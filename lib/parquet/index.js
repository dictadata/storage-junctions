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
  constructor(SMT, options) {
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
        let reader = this.getReadStream(this.options || { max_read: 100 });
        let codify = this.getTransform('codify', this.options || {});

        await pipeline(reader, codify);
        let encoding = await codify.getEncoding();
        this.engram.replace(encoding);
      }
      return this.engram;
    }
    catch (err) {
      logger.error(err);
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
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
  * Return list of schema names found in the data source like files or tables.
  * The smt.schema or options.schema should contain a wildcard character *.
  * If options.forEach is defined it is called for each schema found.
  * Returns list of schemas found.
  * @param {*} options list options
  */
  async list(options) {
    logger.debug('ParquetJunction list');
    let fst = await this.getFileStorage();
    let list = await fst.list(options);
    Cortex.relax(fst);
    return list;
  }


  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern) {
    logger.debug("ParquetJunction store");
    throw new StorageError({ statusCode: 501 }, "Not implemented: ParquetJunction store");
  }

  /**
   *
   */
  async recall(pattern) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: ParquetJunction recall");
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: ParquetJunction retrieve");
  }

  /**
   *
   */
  async dull(pattern) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: ParquetJunction dull");
  }

};
