/**
 * JsonJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResults, StorageError } = require("../types");
const Cortex = require('../cortex');
const JsonReader = require("./reader");
const JsonWriter = require("./writer");
const logger = require("../logger");

const stream = require('stream');


module.exports = exports = class JsonJunction extends StorageJunction {

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
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEncoding() {

    try {
      if (!this.engram.defined) {
        // read file to infer data types
        // default to 100 constructs unless overridden in options
        let reader = this.getReadStream(this.options || { max_read: 100 });
        let codify = this.getTransform('codify', this.options || {});

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
    logger.debug('JsonJunction list');
    let stfs = await this.getFileSystem();
    let list = await stfs.list(options);
    return list;
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
