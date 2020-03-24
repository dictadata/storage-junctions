"use strict";

const Cortex = require('../cortex');
const Engram = require("../engram");
const {StorageError} = require("../types");
const logger = require("../logger");

const Reader = require("./reader");
const Writer = require("./writer");
const Codify = require("./codify");
const Transform = require("./transform");

module.exports = exports = class StorageJunction {

  /**
   *
   * @param {*} SMT an SMT string 'model|locus|schema|key', object or Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    this.engram = new Engram(SMT);
    this.smt = this.engram.smt;
    this.options = options || {};
    this.logger = this.options.logger || logger;
    this.isActive = false;

    // assign stream constructor functions, sub-class should override
    this._readerClass = Reader;
    this._writerClass = Writer;

    // filestorage
    this._fileStorage = null;

    this.logger.debug("StorageJunction");
  }

  static [Symbol.hasInstance](obj) {
    if (obj.engram) return true;
  }

  async activate() {
    this.isActive = true;
  }

  /**
   * relax the junction, i.e. release resources
   */
  async relax() {
    // release an resources
    this.isActive = false;

    if (this._fileStorage)
      Cortex.fileStorage.relax(this._fileStorage);
    this._fileStorage = null;
  }

  ////////// Encoding //////////

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    try {
      // fetch encoding form storage source

      return this.engrams;
    }
    catch(err) {
      this.logger.error(err.message);
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
      this.engram.replace(encoding);

      // save encoding to storage source

      return this.engram || false;
    }
    catch(err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  /**
   * Scan the locus for schemas such as files or tables.
   * The smt.schema must contain a wildcard character *.
   * If options.forEach is defined it is called for each schema found.
   * Returns list of schemas found.
   * @param {*} options scan options
   */
  async scan(options) {
    this.logger.verbose('StorageJunction scan');
    throw new StorageError({ statusCode: 501 }, "method not implemented");

    // StorageJunctions that use FileStorage should implement the following.
    //let fst = await this.getFileStorage();
    //let list = await fst.scan(options);
    //return list;
  }

  /////////// storing & accessing //////////

  /**
   *
   * @param {*} pattern Should contain a meta key used to identify the construct
   *                     If null will insert a new construct into the source
   */
  async store(construct, pattern) {
    this.logger.debug("StorageJunction store");
    throw new StorageError({statusCode: 501}, "method not implemented");
  }

  /**
   * @param {*} pattern Should contain a meta key used to identify the construct.
   */
  async recall(pattern) {
    this.logger.debug("StorageJunction recall");
    throw new StorageError({statusCode: 501}, "method not implemented");
  }

  /**
   * @param {*} pattern should contain a match, filter and cues used to select constructs
   */
  async retrieve(pattern) {
    this.logger.debug("StorageJunction retrieve");

    throw new StorageError({statusCode: 501}, "method not implemented");
  }

  /**
   * pattern can contain a meta key OR a match
   */
  async dull(pattern) {
    this.logger.debug("StorageJunction dull");
    throw new StorageError({statusCode: 400}, "method not implemented");
  }

  ////////// streaming //////////

  // If sub-class sets the _readerClass and _writerClass members in constructor
  // then these methods don't need to be overriden.
  getReadStream(options) {
    options = Object.assign({}, this.options.reader, options);
    return new this._readerClass(this, options);
  }

  getWriteStream(options) {
    options = Object.assign({}, this.options.writer, options);
    return new this._writerClass(this, options);
  }

  // should not need to be overriden, generic transform of JSON objects
  getTransform(options) {
    options = Object.assign({}, this.options.transforms, options);
    return new Transform(this, options);
  }

  // should not need to be overriden, used internally by some subclasses in getEncoding()
  getCodifyWriter(options) {
    options = Object.assign({}, this.options.codify, options);
    return new Codify(this, options);
  }

  ////////// file storage //////////

  /**
   * The prefix of smt.locus determines the filestorage type.
   *
   * (none) local filesystem
   * ftp:
   * s3:
   */
  async getFileStorage() {
    if (this._fileStorage)
      return this._fileStorage;

    this._fileStorage = await Cortex.fileStorage.activate(this.smt, this.options);
    return this._fileStorage;
  }

};
