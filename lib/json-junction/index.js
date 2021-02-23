/**
 * JsonJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResults, StorageError } = require("../types");
const JsonReader = require("./reader");
const JsonWriter = require("./writer");
const logger = require("../logger");

const path = require('path');
const stream = require('stream/promises');


class JsonJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'json|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    logger.debug("JsonJunction");
    super(SMT, options);

    this._readerClass = JsonReader;
    this._writerClass = JsonWriter;

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
        let encoding = await codify.getEncoding();
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
   * @param {*} encoding
   */
  async putEncoding(encoding, overlay=false) {
    if (overlay) {
      this.engram.encoding = encoding;
      return this.engram;
    }
    
    try {
      this.engram.encoding = encoding;
      return this.engram || false;
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern) {
    logger.debug("JsonJunction store");
    throw new StorageError({ statusCode: 501 }, "Not implemented: JsonJunction store");
  }

  /**
   *
   */
  async recall(options) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: JsonJunction recall");
  }

  /**
   *
   * @param {*} options options.pattern
   */
  async retrieve(options) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: JsonJunction retrieve");
  }

  /**
   *
   */
  async dull(options) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: JsonJunction dull");
  }

};

module.exports = JsonJunction;
