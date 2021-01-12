/**
 * CsvJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResults, StorageError } = require("../types");
const CsvReader = require("./reader");
const CsvWriter = require("./writer");
const logger = require("../logger");

const path = require('path');
const stream = require('stream/promises');


module.exports = exports = class CsvJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'csv|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("CsvJunction");

    this._readerClass = CsvReader;
    this._writerClass = CsvWriter;

    // check schema's extension
    if (!this.options.schema && this.smt.schema && this.smt.schema != '*' && path.extname(this.smt.schema) === '')
      this.options.schema = this.smt.schema + '.csv';
    
    // this.options.csvHeader = false;  // default value
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEncoding() {

    try {
      if (!this.engram.defined) {
        // read the file to infer data types
        // default to 100 constructs unless overridden in options
        let reader = this.createReadStream(this.options || { max_read: 100 });
        let codify = this.createTransform("codify", this.options || {});
        await stream.pipeline(reader, codify);

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
  * @param {*} options - list options
  */
  async list(options) {
    logger.debug('CsvJunction list');
    let stfs = await this.getFileSystem();
    let list = await stfs.list(options);
    return list;
  }


  /**
   *
   * @param {*} construct
   * @param {*} pattern
   */
  async store(construct, pattern) {
    logger.debug("CsvJunction store");
    throw new StorageError({ statusCode: 501 }, "Not implemented: CsvJunction store");
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
