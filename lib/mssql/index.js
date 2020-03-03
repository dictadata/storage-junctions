"use strict";

const StorageJunction = require("../junction");
const MSSQLReader = require("./reader");
const MSSQLWriter = require("./writer");
const { StorageResults, StorageError } = require("../types");
const logger = require('../logger');

module.exports = class MSSQLJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'mssql|host|database.table|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options = null) {
    super(SMT, options);

    this._readerClass = MSSQLReader;
    this._writerClass = MSSQLWriter;

    logger.debug("MSSQLJunction");
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    try {
      if (!this.engram.defined) {
        // fetch form storage source
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
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async putEncoding(encoding) {
    try {
      this._engram.replace(encoding);

      // save to source
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} construct
   * @param {*} pattern
   */
  async store(construct, pattern=null) {
    if (typeof construct !== "object")
      throw new StorageError({ statusCode: 400 }, "Invalid parameter: construct is not an object");

    try {
      return new this.StorageResults('invalid');
    }
    catch (err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   */
  async recall(pattern=null) {
    if (!this._engram.smt.key) {
      throw "no storage key specified";
    }

    try {
      return new this.StorageResults('invalid');
    }
    catch (err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern=null) {

    try {
      return new this.StorageResults('invalid');
    }
    catch (err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   */
  async dull(pattern=null) {
    try {
      if (this._engram.smt.key) {
        // delete construct by key
      }
      else {
        // delete all constructs in the .schema
      }

      return new this.StorageResults('invalid');
    }
    catch (err) {
      this._logger.error(err.message);
      throw err;
    }
  }

};
