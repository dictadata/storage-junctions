"use strict";

const Encoding = require("../encoding");
const Reader = require("./reader");
const Writer = require("./writer");
const Codify = require("./codify");
const Transform = require("./transform");
const logger = require("../logger");

module.exports = class StorageJunction {

  /**
   *
   * @param {*} storagePath SMT string 'scheme|location|schema|key' or Engram object
   * @param {*} options
   */
  constructor(storagePath, options = null) {
    //console.log("StorageJunction");

    this._encoding = new Encoding(storagePath);  // class internal
    this._options = options || {};
    this._logger = this._options.logger || logger;

    // assign stream constructor functions, sub-class should override
    this._readerClass = Reader;
    this._writerClass = Writer;
  }

  static [Symbol.hasInstance](obj) {
    if (obj._encoding) return true;
  }

  relax() {
    // release an resources
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    try {
      // fetch encoding form storage source

      return this._encoding;
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
      this._encoding.merge(encoding);

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
  async store(construct, options=null) {
    console.log("StorageJunction store");
    throw new Error("method not implemented");
  }

  /**
   *
   */
  async recall(options=null) {
    console.log("StorageJunction recall");
    throw new Error("method not implemented");
  }

  /**
   *
   */
  async dull(options=null) {
    console.log("StorageJunction dull");
    throw new Error("method not implemented");
  }

  /**
   *
   * @param {*} pattern a pattern to filter the constructs returned
   */
  async retrieve(pattern, options=null) {
    console.log("StorageJunction retrieve");
    throw new Error("method not implemented");
  }

  // If sub-class sets the _readerClass and _writerClass members in constructor
  // then these methods don't need to be overriden.
  getReadStream(options = null) {
    return new this._readerClass(this, Object.assign({}, this._options, options));
  }

  getWriteStream(options = null) {
    return new this._writerClass(this, Object.assign({}, this._options, options));
  }

  // should not need to be overriden, generic transform of JSON objects
  getTransform(options = null) {
    return new Transform(this, Object.assign({}, this._options, options));
  }

  // should not need to be overriden, used internally by some subclasses in getEncoding()
  getCodifyTransform(options = null) {
    return new Codify(this, Object.assign({}, this._options, options));
  }

};
