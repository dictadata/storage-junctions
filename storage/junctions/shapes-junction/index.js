/**
 * ShapesJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResults, StorageError } = require("../types");

const ShapesReader = require("./reader");
const ShapesWriter = require("./writer");
const logger = require("../logger");

const path = require('path');
const stream = require('stream/promises');


class ShapesJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'shp|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    logger.debug("ShapesJunction");
    super(SMT, options);

    this._readerClass = ShapesReader;
    this._writerClass = ShapesWriter;

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
    logger.debug("ShapesJunction store");
    throw new StorageError({ statusCode: 501 }, "Not implemented: ShapesJunction store");
  }

  /**
   *
   */
  async recall(options) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: ShapesJunction recall");
  }

  /**
   *
   * @param {*} options options.pattern
   */
  async retrieve(options) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: ShapesJunction retrieve");
  }

  /**
   *
   */
  async dull(options) {
    throw new StorageError({ statusCode: 501 }, "Not implemented: ShapesJunction dull");
  }

};

module.exports = ShapesJunction;
