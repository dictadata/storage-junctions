"use strict";

const StorageJunction = require("../junction");
const MongoDBReader = require("./reader");
const MongoDBWriter = require("./writer");
const { StorageResults, StorageError } = require("../types");
const logger = require('../logger');

module.exports = class MongoDBJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'mongodb|host|collection|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options = null) {
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
      if (!this.active) {
        // fetch form storage source
      }

      return this._engram;
    }
    catch (err) {
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

      // save to source
    }
    catch (err) {
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
      throw new StorageError({ statusCode: 400 }, "Invalid parameter: construct is not an object");

    try {
      return new this.StorageResults('invalid', null);;
    }
    catch (err) {
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
    catch (err) {
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
    catch (err) {
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
    catch (err) {
      this._logger.error(err.message);
      throw err;
    }
  }

};
