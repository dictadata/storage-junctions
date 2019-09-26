"use strict";

const StorageJunction = require("../junction");
const MSSQLReader = require("./reader");
const MSSQLWriter = require("./writer");
const StorageError = require("../storage_error");

module.exports = class MSSQLJunction extends StorageJunction {

  /**
   *
   * @param {*} storagePath 'mssql|host|database.table|key' or an Engram object
   * @param {*} options
   */
  constructor(storagePath, options = null) {
    super(storagePath, options);

    this._readerClass = MSSQLReader;
    this._writerClass = MSSQLWriter;

    //console.log("MSSQLJunction");
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    try {
      // fetch encoding form storage source
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
      this._engram.merge(encoding);
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
      let results = {};
      return results;
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
    if (!this._engram.key) {
      throw "no storage key specified";
    }

    try {
      let results = {};
      return results;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern, options = null) {
    if (typeof pattern !== "object")
      throw new StorageError({statusCode: 400}, "Invalid parameter: pattern is not an object");

    try {
      let constructs = [];
      return constructs;
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
      let results = {};
      if (this._engram.key)
        results = {};  // delete construct by ID
      else
        results = {};  // delete all constructs in the .schema
      return results;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

};
