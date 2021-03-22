/**
 * JSONJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResults, StorageError } = require("../types");
const JSONReader = require("./reader");
const JSONWriter = require("./writer");
const logger = require("../logger");

const path = require('path');
const stream = require('stream/promises');


class JSONJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'json|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    logger.debug("JSONJunction");
    super(SMT, options);

    this._readerClass = JSONReader;
    this._writerClass = JSONWriter;

    // check schema's extension
    if (!this.options.schema && this.smt.schema && this.smt.schema != '*' && path.extname(this.smt.schema) === '')
      this.options.schema = this.smt.schema + '.json';
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEncoding() {

    try {
      if (!this.engram.isDefined) {
        // read file to infer data types
        // default to 100 constructs unless overridden in options
        let options = Object.assign({ max_read: 100 }, this.options);
        let reader = this.createReadStream(options);
        let codify = this.createTransform('codify', options);

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
   */
  async store(construct, pattern) {
    logger.debug("JSONJunction store");
    throw new StorageError({ statusCode: 501 }, "Not implemented: JSONJunction store");
  }

  /**
   *
   */
  async recall(options) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: JSONJunction recall");
  }

  /**
   *
   * @param {*} options options.pattern
   */
  async retrieve(options) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: JSONJunction retrieve");
  }

  /**
   *
   */
  async dull(options) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: JSONJunction dull");
  }

};

module.exports = JSONJunction;
