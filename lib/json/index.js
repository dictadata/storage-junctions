/**
 * JsonJunction
 */
"use strict";

const StorageJunction = require("../junction");
const JsonReader = require("./reader");
const JsonWriter = require("./writer");
const { StorageResults, StorageError } = require("../types");
const logger = require('../logger');

const stream = require('stream');
const util = require('util');
const path = require('path');

const pipeline = util.promisify(stream.pipeline);

module.exports = class JsonJunction extends StorageJunction {

  /**
   *
   * @param {*} storagePath 'json|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(storagePath, options = null) {
    logger.debug("JsonJunction");
    super(storagePath, options);

    this._readerClass = JsonReader;
    this._writerClass = JsonWriter;

    this.filename = this._options.filename || path.join(this._engram.location, this._engram.schema) || '';
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEncoding() {

    try {
      if (!this.active) {
        // read file to infer data types
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
   *
   * @param {*} construct
   */
  async store(construct, options = null) {
    logger.debug("JsonJunction store");
    throw new StorageError({ statusCode: 501 }, "Not implemented: JsonJunction store");
  }

  /**
   *
   */
  async recall(options = null) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: JsonJunction recall");
  }

  /**
   *
   * @param {*} options options.pattern
   */
  async retrieve(options = null) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: JsonJunction retrieve");
  }

  /**
   *
   */
  async dull(options = null) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: JsonJunction dull");
  }

};
