/**
 * ShapesJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResponse, StorageError } = require("../../types");
const { logger } = require("../../utils");

const ShapesReader = require("./shapes-reader");
const ShapesWriter = require("./shapes-writer");

const path = require('path');
const stream = require('stream/promises');


class ShapesJunction extends StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    filesystem: true, // storage source is filesystem
    sql: false,        // storage source is SQL
    keystore: false,   // supports key-value storage

    encoding: false,   // get encoding from source
    store: false,      // store/recall individual constructs
    query: false,      // select/filter data at source
    aggregate: false   // aggregate data at source
  }

  // assign stream constructor functions, sub-class must override
  _readerClass = ShapesReader;
  _writerClass = ShapesWriter;

  /**
   *
   * @param {*} SMT 'shp|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    logger.debug("ShapesJunction");
    super(SMT, options);

    // check schema's extension
    if (!this.options.schema && this.smt.schema && this.smt.schema != '*' && path.extname(this.smt.schema) === '')
      this.options.schema = this.smt.schema + '.shp';
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEncoding() {

    try {
      if (!this.engram.isDefined) {
        // read file to infer data types
        // default to 100 constructs unless overridden in options
        let options = Object.assign({}, { max_read: 100 }, this.options);        
        let reader = this.createReadStream(options);
        let codify = this.createTransform('codify', options);

        await stream.pipeline(reader, codify);
        let encoding = codify.encoding;
        this.engram.encoding = encoding;
      }
      return new StorageResponse(0, null, this.engram.encoding, "encodign");
    }
    catch (err) {
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
   */
  async store(construct, pattern) {
    logger.debug("ShapesJunction store");
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
   * @param {*} options options.pattern
   */
  async retrieve(options) {
    throw new StorageError(501);
  }

  /**
   *
   */
  async dull(options) {
    throw new StorageError(501);
  }

};

module.exports = ShapesJunction;
