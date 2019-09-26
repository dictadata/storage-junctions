/**
 * JsonJunction
 */
"use strict";

const StorageJunction = require("../junction");
const JsonReader = require("./reader");
const JsonWriter = require("./writer");
const stream = require('stream');
const util = require('util');
const path = require('path');

const pipeline = util.promisify(stream.pipeline);

module.exports = class JsonJunction extends StorageJunction {

  /**
   *
   * @param {*} storagePath 'json|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(storagePath, options = null) {
    //console.log("JsonJunction");
    super(storagePath, options);

    this._readerClass = JsonReader;
    this._writerClass = JsonWriter;

    this.filename = this._options.filename || path.join(this._engram.location, this._engram.schema) || '';
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEncoding() {

    try {
      // default to 1000 constructs unless overridden in options

      let reader = this.getReadStream( Object.assign({codify: true, max_read: 1000}, this._options) );
      let codify = this.getCodifyTransform();

      await pipeline(reader, codify);
      let encoding = await codify.getEncoding();
      this._engram.merge(encoding);

      return this._engram;
    }
    catch(err) {
      this._logger.error(err.message);
    }
  }

  /**
   * Sets the encoding for the storage node.
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
  async store(construct, options=null) {
    //console.log("JsonJunction store");

    throw new Error("Not implemented: JsonJunction store");

    // eslint-disable-next-line no-unreachable
    try {
      // store it
    }
    catch(err) {
      this._logger.error(err.message);
      return false;
    }

    return true;
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
   */
  async dull(options = null) {
    try {
      let results = {};
      if (this._engram.key)
        results = {};  // delete construct by ID
      else
        results = {};  // delete all constructs in the .schema

      try {
        //if (fs.existsSync(this._engram.schema))
        //  fs.truncateSync(this._engram.schema);
      }
      catch(err) {
        if (err.status != 404)
          console.log(err);
      }

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
      throw new Error("Invalid parameter: pattern is not an object");

    try {
      let constructs = [];
      return constructs;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

};
