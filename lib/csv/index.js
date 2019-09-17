/**
 * CsvJunction
 */
"use strict";

const StorageJunction = require("../junction");
const CsvReader = require("./reader");
const CsvWriter = require("./writer");
const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

module.exports = class CsvJunction extends StorageJunction {

  /**
   *
   * @param {*} storagePath 'csv|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(storagePath, options = null) {
    //console.log("CsvJunction");
    super(storagePath, options);

    this._readerClass = CsvReader;
    this._writerClass = CsvWriter;

    this.filename = options && options.filename || '';
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEncoding() {

    try {
      let reader = this.getReadStream( Object.assign({codify: true, max_lines: 1000}, this._options) );
      let codify = this.getCodifyTransform();

      await pipeline(reader, codify);
      let encoding = await codify.getEncoding();
      this._encoding.merge(encoding);

      return this._encoding;
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
      Object.assign(this._encoding, encoding);
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
    //console.log("CsvJunction store");
    throw new Error("Not implemented: CsvJunction store");

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
    if (!this._encoding.key) {
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
      if (this._encoding.key)
        results = {};  // delete construct by ID
      else
        results = {};  // delete all constructs in the container

      try {
        //if (fs.existsSync(this.containerName))
        //  fs.truncateSync(this.containerName);
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
