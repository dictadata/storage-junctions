/**
 * EchoJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const EchoReader = require("./reader");
const EchoWriter = require("./writer");
const { typeOf, StorageError } = require("../types");
const logger = require('../logger');

class EchoJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT smt string or smt object
   * @param {*} options
   */
  constructor(SMT, options) {
    logger.debug("new EchoJunction");
    super(SMT, options);

    // override stream constructor functions
    this._readerClass = EchoReader;
    this._writerClass = EchoWriter;
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    try {
      // fetch encoding from storage source

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

      // save encoding to storage source
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
   * @param {*} pattern Object containing match, filter and cue elements
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

module.exports = EchoJunction;
