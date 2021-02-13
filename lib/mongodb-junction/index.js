"use strict";

const StorageJunction = require("../storage-junction");
const MongoDBReader = require("./reader");
const MongoDBWriter = require("./writer");
const { typeOf, StorageError } = require("../types");
const logger = require('../logger');

class MongoDBJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'mongodb|host|collection|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);

    logger.debug("MongoDBJunction");

    this._readerClass = MongoDBReader;
    this._writerClass = MongoDBWriter;
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    try {
      if (!this.engram.isDefined) {
        // fetch form storage source
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
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async putEncoding(encoding, overlay=false) {
    if (overlay) {
      this.engram.replace(encoding);
      return this.engram;
    }
    
    try {
      this.engram.replace(encoding);

      // save to source
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   * @param {*} construct
   * @param {*} pattern
   */
  async store(construct, pattern) {
    if (typeOf(construct) !== "object")
      throw new StorageError({ statusCode: 400 }, "Invalid parameter: construct is not an object");

    try {
      return new this.StorageResults('invalid');
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   */
  async recall(pattern) {
    if (!this.engram.smt.key) {
      throw "no storage key specified";
    }

    try {
      return new this.StorageResults('invalid');
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {

    try {
      return new this.StorageResults('invalid');
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   */
  async dull(pattern) {
    try {
      if (this.engram.smt.key) {
        // delete construct by key
      }
      else {
        // delete all constructs in the .schema
      }

      return new this.StorageResults('invalid');
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

};

//MongoDBJunction.encoder = encoder;
//MongoDBJunction.xxxEncoder = xxxEncoder;
module.exports = MongoDBJunction;
