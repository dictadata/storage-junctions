/**
 * CSVJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResults, StorageError } = require("../types");
const CSVReader = require("./reader");
const CSVWriter = require("./writer");
const logger = require("../logger");

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
      return this.engram;
    }
    catch (err) {
      logger.error(err);
      throw err;
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
    throw new StorageError({ statusCode: 501 }, "Not implemented: CSVJunction store");
  }

  /**
   *
   */
  async recall(pattern) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: CSVJunction recall");
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: CSVJunction retrieve");
  }

  /**
   *
   */
  async dull(pattern) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: CSVJunction dull");
  }

};

module.exports = CSVJunction;
