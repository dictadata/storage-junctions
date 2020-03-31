"use strict";

const Cortex = require('../cortex');
const Engram = require("../engram");
const {StorageError} = require("../types");
const logger = require("../logger");

const Reader = require("./reader");
const Writer = require("./writer");
const Codify = require("./codifyWriter");

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

    this.isActive = false;

    // assign stream constructor functions, sub-class should override
    this._readerClass = Reader;
    this._writerClass = Writer;

    // filestorage
    this._fileStorage = null;

    logger.debug("StorageJunction");
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
      Cortex.FileStorage.relax(this._fileStorage);
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
      logger.error(err);
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
      logger.error(err);
      throw err;
    }
  }

  /////////// storing & accessing //////////

  /**
   *
   * @param {*} pattern Should contain a meta key used to identify the construct
   *                     If null will insert a new construct into the source
   */
  async store(construct, pattern) {
    logger.debug("StorageJunction store");
    throw new StorageError({statusCode: 501}, "method not implemented");
  }

  /**
   * @param {*} pattern Should contain a meta key used to identify the construct.
   */
  async recall(pattern) {
    logger.debug("StorageJunction recall");
    throw new StorageError({statusCode: 501}, "method not implemented");
  }

  /**
   * @param {*} pattern should contain a match, filter and cues used to select constructs
   */
  async retrieve(pattern) {
    logger.debug("StorageJunction retrieve");

    throw new StorageError({statusCode: 501}, "method not implemented");
  }

  /**
   * pattern can contain a meta key OR a match
   */
  async dull(pattern) {
    logger.debug("StorageJunction dull");
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

  // should not need to be overriden, generic transform of JSON object properties
  getTransform(tfType, options) {
    options = Object.assign({}, this.options.transform, options);
    let transform = Cortex.Transforms.create(tfType, options);
    return transform;
  }
/*
  // should not need to be overriden, used internally by some subclasses in getEncoding()
  getCodifyWriter(options) {
    options = Object.assign({}, this.options.codify, options);
    return new Codify(this, options);
  }
*/
  ////////// storage systems //////////

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

    this._fileStorage = await Cortex.FileStorage.activate(this.smt, this.options);
    return this._fileStorage;
  }

  /**
   * Return list of schema names found in the data source like files or tables.
   * smt.schema or options.schema should contain a wildcard character *.
   * Returns list of schema names found.
   * If options.forEach is defined it is called for each schema found and
   * the returned list will be empty.
   * @param {*} options list options
   */
  async list(options) {
    logger.verbose('StorageJunction list');
    throw new StorageError({ statusCode: 501 }, "method not implemented");

    // StorageJunctions that use FileStorage should implement the following.
    //let fst = await this.getFileStorage();
    //let list = await fst.list(options);
    //return list;
  }

};
