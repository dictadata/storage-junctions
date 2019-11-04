"use strict";

const Engram = require("../engram");
const Reader = require("./reader");
const Writer = require("./writer");
const Codify = require("./codify");
const Transform = require("./transform");
const logger = require("../logger");
const {StorageError} = require("../types");

module.exports = class StorageJunction {

  /**
   *
   * @param {*} SMT an SMT string 'model|locus|schema|key' or Engram object
   * @param {*} options
   */
  constructor(SMT, options = null) {
    logger.debug("StorageJunction");

    this._engram = new Engram(SMT);  // class internal
    this._options = options || {};
    this._logger = this._options.logger || logger;

    // assign stream constructor functions, sub-class should override
    this._readerClass = Reader;
    this._writerClass = Writer;
  }

  static [Symbol.hasInstance](obj) {
    if (obj._engram) return true;
  }

  /**
   * relax the junction, i.e. release resources
   */
  async relax() {
    // release an resources
  }

  ////////// Encoding //////////

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    try {
      // fetch encoding form storage source

      return this._engrams;
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

      return this._engram || false;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   * Scan the locus for schemas.
   * The smt.schema must contain a wildcard character *.
   * If options.forEach is defined it is called for each schema found.
   * Returns list of schemas found.
   * @param {*} construct
   * @param {*} options
   */
  async scan(options) {
    logger.verbose('StorageJunction scan');
    throw new StorageError({ statusCode: 501 }, "method not implemented");
  }

  /////////// storing & accessing //////////

  /**
   *
   * @param {*} construct
   */
  async store(construct, options=null) {
    logger.debug("StorageJunction store");
    throw new StorageError({statusCode: 501}, "method not implemented");
  }

  /**
   *
   */
  async recall(options=null) {
    logger.debug("StorageJunction recall");
    throw new StorageError({statusCode: 501}, "method not implemented");
  }

  /**
   *
   * @param {*} options options.pattern a pattern to select the constructs returned
   */
  async retrieve(options=null) {
    logger.debug("StorageJunction retrieve");
    let pattern = options && (options.pattern || options);

    throw new StorageError({statusCode: 501}, "method not implemented");
  }

  /**
   *
   */
  async dull(options=null) {
    logger.debug("StorageJunction dull");
    throw new StorageError({statusCode: 400}, "method not implemented");
  }

  ////////// streaming //////////

  // If sub-class sets the _readerClass and _writerClass members in constructor
  // then these methods don't need to be overriden.
  getReadStream(options = null) {
    return new this._readerClass(this, Object.assign({}, this._options, options));
  }

  getWriteStream(options = null) {
    return new this._writerClass(this, Object.assign({}, this._options, options));
  }

  // should not need to be overriden, generic transform of JSON objects
  getTransform(transforms = null) {
    return new Transform(this, Object.assign({}, this._options, transforms));
  }

  // should not need to be overriden, used internally by some subclasses in getEncoding()
  getCodifyTransform(options = null) {
    return new Codify(this, Object.assign({}, this._options.codify, options));
  }

};
