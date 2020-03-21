"use strict";

const Engram = require("../engram");
const Reader = require("./reader");
const Writer = require("./writer");
const Codify = require("./codify");
const Transform = require("./transform");
const logger = require("../logger");
const {StorageError} = require("../types");

module.exports = exports = class StorageJunction {

  /**
   *
   * @param {*} SMT an SMT string 'model|locus|schema|key' or Engram object
   * @param {*} options
   */
  constructor(SMT, options = null) {
    this._engram = new Engram(SMT);  // class internal
    this._options = options || {};
    this._logger = this._options.logger || logger;

    // assign stream constructor functions, sub-class should override
    this._readerClass = Reader;
    this._writerClass = Writer;

    this._logger.debug("StorageJunction");
  }

  static [Symbol.hasInstance](obj) {
    if (obj._engram) return true;
  }

  ifOptions(dst, names) {
    if (!Array.isArray(names))
      names = [names];

    for (let name of names)
      if (Object.prototype.hasOwnProperty.call(this._options, name))
        dst[name] = this._options[name];
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
   * Scan the locus for schemas such as files or tables.
   * The smt.schema must contain a wildcard character *.
   * If options.forEach is defined it is called for each schema found.
   * Returns list of schemas found.
   * @param {*} construct
   * @param {*} options
   */
  async scan(options=null) {
    this._logger.verbose('StorageJunction scan');
    throw new StorageError({ statusCode: 501 }, "method not implemented");
  }

  /////////// storing & accessing //////////

  /**
   *
   * @param {*} pattern Should contain a meta key used to identify the construct
   *                     If null will insert a new construct into the source
   */
  async store(construct, pattern=null) {
    this._logger.debug("StorageJunction store");
    throw new StorageError({statusCode: 501}, "method not implemented");
  }

  /**
   * @param {*} pattern Should contain a meta key used to identify the construct.
   */
  async recall(pattern=null) {
    this._logger.debug("StorageJunction recall");
    throw new StorageError({statusCode: 501}, "method not implemented");
  }

  /**
   * @param {*} pattern should contain a match, filter and cues used to select constructs
   */
  async retrieve(pattern=null) {
    this._logger.debug("StorageJunction retrieve");

    throw new StorageError({statusCode: 501}, "method not implemented");
  }

  /**
   * pattern can contain a meta key OR a match
   */
  async dull(pattern=null) {
    this._logger.debug("StorageJunction dull");
    throw new StorageError({statusCode: 400}, "method not implemented");
  }

  ////////// streaming //////////

  // If sub-class sets the _readerClass and _writerClass members in constructor
  // then these methods don't need to be overriden.
  getReadStream(options = null) {
    return new this._readerClass(this, options || this._options.reader || {});
  }

  getWriteStream(options = null) {
    return new this._writerClass(this, options || this._options.writer || {});
  }

  // should not need to be overriden, generic transform of JSON objects
  getTransform(options = null) {
    return new Transform(this, options || this._options.transforms || {});
  }

  // should not need to be overriden, used internally by some subclasses in getEncoding()
  getCodifyWriter(options = null) {
    return new Codify(this, options || this._options.codify || {});
  }

};
