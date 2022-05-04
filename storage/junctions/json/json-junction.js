/**
 * JSONJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResponse, StorageError } = require("../../types");
const { logger } = require("../../utils");
const JSONReader = require("./json-reader");
const JSONWriter = require("./json-writer");

const path = require('path');
const stream = require('stream/promises');


class JSONJunction extends StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    filesystem: true, // storage source is filesystem
    sql: false,        // storage source is SQL
    keystore: false,   // supports key-value storage

    encoding: false,   // get encoding from source
    reader: true,     // stream reader
    writer: true,     // stream writer
    store: false,      // store/recall individual constructs
    query: false,      // select/filter data at source
    aggregate: false   // aggregate data at source
  }

  // assign stream constructor functions, sub-class must override
  _readerClass = JSONReader;
  _writerClass = JSONWriter;

  /**
   *
   * @param {*} smt 'json|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(smt, options) {
    logger.debug("JSONJunction");
    super(smt, options);

    // check schema's extension
    //if (!this.options.schema && this.smt.schema && this.smt.schema != '*' && path.extname(this.smt.schema) === '')
    //  this.options.schema = this.smt.schema + '.json';
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

        let reader = this.createReader(options);
        reader.on('error', (error) => {
          logger.error("json codify reader: " + error.message);
        });

        let codify = this.createTransform('codify', options);
        await stream.pipeline(reader, codify);

        let encoding = codify.encoding;
        this.engram.encoding = encoding;
      }

      return new StorageResponse(0, null, this.engram.encoding, "encoding");
    }
    catch (err) {
      if (err instanceof StorageError)
        throw err;
      else {
        logger.error(err);
        throw new StorageError(500).inner(err);
      }
    }
  }

  /**
   * Sets the encoding for the storage node.
   * @param {*}
   */
  async createSchema(options = {}) {
    return super.createSchema(options);
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern) {
    logger.debug("JSONJunction store");
    throw new StorageError(501);
  }

  /**
   *
   */
  async recall(options) {
    throw new StorageError(501);
  }

  /**
   *
   */
  async dull(options) {
    throw new StorageError(501);
  }

  /**
   *
   * @param {*} options options.pattern
   */
  async retrieve(options) {
    throw new StorageError(501);
  }

};

module.exports = JSONJunction;
