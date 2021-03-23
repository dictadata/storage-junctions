"use strict";

const Cortex = require('../../cortex');
const { Engram, StorageError } = require("../../types");
const logger = require("../../logger");

const Reader = require("./storage-reader");
const Writer = require("./storage-writer");
const Encoder = require("./storage-encoder");

const stream = require('stream');

class StorageJunction {

  /**
   *
   * @param {*} SMT an SMT string 'model|locus|schema|key', object or Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    this.engram = new Engram(SMT);
    this.smt = this.engram.smt;
    this.options = Object.assign({}, options);
    if (this.options.encoding) {
      this.engram.encoding = this.options.encoding;
      delete this.options.encoding;
    }

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

  ////////// Encoding //////////

  /**
   * Sets encoding for the storage schema.
   * @param {*} encoding
   */
  set encoding(encoding) {
    try {
      this.engram.encoding = encoding;
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }
  
  /**
   * Get the schema's encoding.
   */
  get encoding() {
    return this.engram.encoding;
  }

  /**
   * Get the schema's encoding.
   * If not defined, request encoding from the storage source.
   */
  async getEncoding() {
    if (!this.engram.isDefined) {
      // get encoding from source
    }
    return this.engram;
  }

  /**
   * Sets encoding for the storage schema.
   * Create schema at the storage locus, if it doesn't exist.
   * @param {*} encoding
   * @param {Boolean} overlay when true only use encoding locally for validation, default = false
   */
  async putEncoding(encoding) {
    return this.createSchema({ encoding: encoding });
  }

  ////////// Schema instance //////////

  /**
   * List schemas at the storage locus.
   * Return list of schema names found in the data source like files or tables.
   * smt.schema or options.schema should contain a wildcard character *.
   * Returns list of schema names found.
   * If options.forEach is defined it is called for each schema found and
   * the returned list will be empty.
   * @param {*} options list options
   */
  async list(options) {
    logger.debug('StorageJunction list');
    options = Object.assign({}, this.options, options);

    // junctions that don't use filesystems should override the list() method
    if (!Cortex.FileSystems.isUsedBy(this.smt.model))
      throw new StorageError({ statusCode: 501 }, "StorageJunction.list method not implemented");

    // default implementation for StorageJunctions that use FileSystems
    let stfs = await this.getFileSystem();
    let list = await stfs.list(options);
    return list;
  }

  /**
   * Create schema at the storage locus. 
   * @param {Object} options optional, options.schema name to use instead of junction's smt.schema
   */
  async createSchema(options={}) {
    logger.debug('StorageJunction createSchema');
    options = Object.assign({}, this.options, options);
    if (!options.schema)
      options.schema = this.smt.schema;
    if (options.encoding) {
      this.engram.encoding = options.encoding;
      delete options.encoding;
    }

    return this.engram;
  }

  /**
   * Dull schema at the storage locus. 
   * Junction implementations will translate to delete file, DROP TABLE, delete index, etc.
   * @param {Object} options optional, options.schema name to use instead of junction's smt.schema
   */
  async dullSchema(options) {
    logger.debug('StorageJunction dullSchema');
    options = Object.assign({}, this.options, options);
    if (!options.schema)
      options.schema = this.smt.schema;

    // junctions that don't use filesystems should override the dullSchema() method
    if (!Cortex.FileSystems.isUsedBy(this.smt.model))
      throw new StorageError({ statusCode: 501 }, "StorageJunction.dullSchema method not implemented");

    // default implementation for StorageJunctions that use FileSystems
    let stfs = await this.getFileSystem();
    let result = await stfs.dull(options);
    return result;
  }

  /////////// storing & accessing //////////

  /**
   *
   * @param {Object} constuct object to be save
   * @param {Object} pattern Should contain a meta key used to identify the construct
   *                     If null will insert a new construct into the source
   */
  async store(construct, pattern) {
    logger.debug("StorageJunction store");
    throw new StorageError({ statusCode: 501 }, "StorageJunction.store method not implemented");
  }

  /**
   *
   * @param {Array} constuct object to be save
   * @param {Object} pattern Should contain a meta key used to identify the construct
   *                     If null will insert a new construct into the source
   */
  async storeBulk(constructs, pattern) {
    logger.debug("StorageJunction storeBulk");
    throw new StorageError({ statusCode: 501 }, "StorageJunction.storeBulk method not implemented");
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
    let pattern = options.pattern || options;

    let reader = new this._readerClass(this, options);
    // if source doesn't support queries, use filter and select transforms instead
    if (reader.useTransforms) {
      if (pattern.match)
        reader = reader.pipe(this.createTransform("filter", { match: pattern.match }));
      if (pattern.fields)
        reader = reader.pipe(this.createTransform("select", { fields: pattern.fields }));
    }
    return reader;
  }

  createWriteStream(options) {
    options = Object.assign({}, this.options, options);
    return new this._writerClass(this, options);
  }

  // should not need to be overriden, generic transform of JSON objects
  createTransform(tfType, options) {
    options = Object.assign({}, this.options, options);
    let transform_options = options.transform || options;
    let transform = Cortex.Transforms.create(tfType, transform_options);
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

module.exports = StorageJunction;
