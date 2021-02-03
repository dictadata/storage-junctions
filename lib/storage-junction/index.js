"use strict";

const Cortex = require('../cortex');
const Engram = require("../engram");
const { StorageError } = require("../types");
const logger = require("../logger");

const Reader = require("./reader");
const Writer = require("./writer");

const stream = require('stream');

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

    this._isActive = false;

    // assign stream constructor functions, sub-class should override
    this._readerClass = Reader;
    this._writerClass = Writer;

    // filesystem
    this._fileSystem = null;

    logger.debug("StorageJunction");
  }

  static [Symbol.hasInstance](obj) {
    if (obj.engram) return true;
  }

  // override to initialize junction
  async activate() {
    this._isActive = true;
  }

  /**
   * override to release resources
   */
  async relax() {
    // release an resources
    this._isActive = false;

    if (this._fileSystem)
      await Cortex.FileSystems.relax(this._fileSystem);
    this._fileSystem = null;
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

    // junctions that don't use filesystems should override the list() method
    if (!Cortex.FileSystems.isUsedBy(this.smt.model))
      throw new StorageError({ statusCode: 501 }, "StorageJunction.list method not implemented");

    // default implementation for StorageJunctions that use FileSystems
    options = Object.assign({}, this.options, options);

    let stfs = await this.getFileSystem();
    let list = await stfs.list(options);
    return list;
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
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async putEncoding(encoding, overlay=false) {
    if (overlay) {
      this.engram.replace(encoding);
      return this.engram;
    }
    
    try {
      this.engram.replace(encoding);

      // save encoding to storage source

      return this.engram || false;
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /////////// storing & accessing //////////

  /**
   *
   * @param {*} constuct object to be save
   * @param {*} pattern Should contain a meta key used to identify the construct
   *                     If null will insert a new construct into the source
   */
  async store(construct, pattern) {
    logger.debug("StorageJunction store");
    throw new StorageError({ statusCode: 501 }, "StorageJunction.store method not implemented");
  }

  /**
   * @param {*} pattern Should contain a meta key used to identify the construct.
   */
  async recall(pattern) {
    logger.debug("StorageJunction recall");
    throw new StorageError({ statusCode: 501 }, "StorageJunction.recall method not implemented");
  }

  /**
   * @param {*} pattern can contain match, fields, .etc used to select constructs
   */
  async retrieve(pattern) {
    logger.debug("StorageJunction retrieve");

    throw new StorageError({ statusCode: 501 }, "StorageJunction.retrieve method not implemented");
  }

  /**
   * pattern can contain a meta key OR a match
   */
  async dull(pattern) {
    logger.debug("StorageJunction dull");
    throw new StorageError({ statusCode: 400 }, "StorageJunction.dull method not implemented");
  }

  ////////// object streaming //////////

  // If sub-class sets the _readerClass and _writerClass members in constructor
  // then these methods don't need to be overriden.
  createReadStream(options) {
    options = Object.assign({}, this.options, options);

    let reader = new this._readerClass(this, options);
    // if source doesn't support queries, use filter and select transforms instead
    if (reader.useTransforms) {
      if (options.match)
        reader = reader.pipe(this.createTransform("filter", { match: options.match }));
      if (options.fields)
        reader = reader.pipe(this.createTransform("select", { fields: options.fields }));
    }
    return reader;
  }

  createWriteStream(options) {
    options = Object.assign({}, this.options, options);
    return new this._writerClass(this, options);
  }

  // should not need to be overriden, generic transform of JSON objects
  createTransform(tfType, options) {
    options = Object.assign({}, this.options.transform, options);
    let transform = Cortex.Transforms.create(tfType, options);
    return transform;
  }

  ////////// file storage systems //////////

  /**
   * Uses the prefix of smt.locus to determine the filesystem type.
   *
   * file: or (none) local filesystem
   * fs: local filesystem
   * ftp: ftp path, options.ftp contains login information
   * http: or https:
   * s3: s3 bucket/prefix, options.s3.aws_profile contains the section in ~/.aws/credentials
   */
  async getFileSystem() {
    if (!this._fileSystem)
      this._fileSystem = await Cortex.FileSystems.activate(this.smt, this.options);
    return this._fileSystem;
  }

};
