/**
 * EchoJunction
 */
"use strict";

const StorageJunction = require("../junction");
const EchoReader = require("./reader");
const EchoWriter = require("./writer");
const { StorageResults, StorageError } = require("../types");
const logger = require('../logger');

module.exports = class EchoJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT smt string or smt object
   * @param {*} options
   */
  constructor(SMT, options = null) {
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

      return this._engram;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async putEncoding(encoding) {
    try {
      this._engram.replace(encoding);

      // save encoding to storage source
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
    if (typeof construct !== "object")
      throw new StorageError({statusCode: 400}, "Invalid parameter: construct is not an object");

    try {
      return new this.StorageResults('invalid', null);
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   */
  async recall(options = null) {
    if (!this._engram.smt.key) {
      throw "no storage key specified";
    }

    try {
      return new this.StorageResults('invalid', null);;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} options options.pattern
   */
  async retrieve(options = null) {

    try {
      return new this.StorageResults('invalid', null);;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   */
  async dull(options = null) {
    try {
      if (this._engram.smt.key) {
        // delete construct by key
      }
      else {
        // delete all constructs in the .schema
      }

      return new this.StorageResults('invalid', null);;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

};
