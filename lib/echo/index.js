/**
 * EchoJunction
 */
"use strict";

const StorageJunction = require("../junction");
const EchoReader = require("./reader");
const EchoWriter = require("./writer");
const StorageError = require("../storage_error");

module.exports = class EchoJunction extends StorageJunction {

  /**
   *
   * @param {*} storagePath 'echo|location|schema|key' or an Engram object
   * @param {*} options
   */
  constructor(storagePath, options = null) {
    console.log("new EchoJunction");
    super(storagePath, options);

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
      this._engram.merge(encoding);

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
   * @param {*} options options.pattern
   */
  async retrieve(options = null) {

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
