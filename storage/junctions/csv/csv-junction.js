/**
 * CSVJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResults, StorageError } = require("../../types");
const CSVReader = require("./csv-reader");
const CSVWriter = require("./csv-writer");
const logger = require("../../logger");

const path = require('path');
const stream = require('stream/promises');


class CSVJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'csv|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("CSVJunction");

    this._readerClass = CSVReader;
    this._writerClass = CSVWriter;

    // check schema's extension
    if (!this.options.schema && this.smt.schema && this.smt.schema != '*' && path.extname(this.smt.schema) === '')
      this.options.schema = this.smt.schema + '.csv';
    
    // this.options.header = false;  // default value
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEncoding() {
    logger.debug("CSVJunction get encoding");
    
    try {
      if (!this.engram.isDefined) {
        // read the file to infer data types
        // default to 100 constructs unless overridden in options
        let options = Object.assign({ max_read: 100 }, this.options);
        let reader = this.createReadStream(options);
        let codify = this.createTransform("codify", options);
        await stream.pipeline(reader, codify);

        let encoding = codify.encoding;
        this.engram.encoding = encoding;
      }
      return new StorageResults(0, null, this.engram, "encoding");
    }
    catch (err) {
      if (e instanceof StorageError)
        throw err;
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   * Sets the encoding for the storage node.
   * @param {*} 
   */
  async createSchema(options={}) {
    return super.createSchema(options);
  }

  /**
   *
   * @param {*} construct
   * @param {*} pattern
   */
  async store(construct, pattern) {
    logger.debug("CSVJunction store");
    throw new StorageError(501);
  }

  /**
   *
   */
  async recall(pattern) {
    throw new StorageError(501);
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {
    throw new StorageError(501);
  }

  /**
   *
   */
  async dull(pattern) {
    throw new StorageError(501);
  }

};

module.exports = CSVJunction;
