"use strict";

const Cortex = require('../../cortex');
const { Engram, StorageResponse, StorageError } = require("../../types");
const { logger } = require("../../utils");

const Reader = require("./storage-reader");
const Writer = require("./storage-writer");

const stream = require('stream');

module.exports = exports = class StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    filesystem: true, // storage source is filesystem
    sql: false,        // storage source is SQL
    keystore: false,   // supports key-value storage

    encoding: false,   // get encoding from source
    store: false,      // store/recall individual constructs
    query: false,      // select/filter data at source
    aggregate: false   // aggregate data at source
  }

  // assign stream constructor functions, sub-class must override
  _readerClass = Reader;
  _writerClass = Writer;
  _fileSystem = null;

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

    this.isActive = false;

    logger.debug("StorageJunction");
  }

  static [Symbol.hasInstance](obj) {
    if (obj.engram) return true;
  }

  // override to initialize junction
  async activate() {
    this.isActive = true;
  }

  /**
   * override to release resources
   */
  async relax() {
    // release an resources
    this.isActive = false;

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
    this.engram.encoding = encoding;
  }
  
  /**
   * Get the schema's encoding.
   */
  get encoding() {
    if (!this.engram.isDefined) {
      throw new StorageError(404);
    }
    return this.engram.encoding;
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
    if (!this.capabilities.filesystem)
      throw new StorageError(501);

    // default implementation for StorageJunctions that use FileSystems
    let stfs = await this.getFileSystem();
    let results = await stfs.list(options);

    return results;
  }

  /**
   * Get the schema's encoding.
   * If not defined, request encoding from the storage source.
   */
  async getEncoding() {
    logger.debug('StorageJunction getEncoding');
    if (!this.capabilities.encoding)
      throw new StorageError(405);
    return new StorageError(501);
  }

  /**
   * Create schema at the storage locus. 
   * @param {Object} options optional, options.schema name to use instead of junction's smt.schema
   */
  async createSchema(options={}) {
    logger.debug('StorageJunction createSchema');
    if (!this.capabilities.encoding)
      throw new StorageError(405);
    return new StorageError(501);
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
    if (!this.capabilities.filesystem)
      throw new StorageError(501);

    // default implementation for StorageJunctions that use FileSystems
    let stfs = await this.getFileSystem();
    let results = await stfs.dull(options);

    return results;
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
    if (!this.capabilities.store)
      throw new StorageError(405);
    throw new StorageError(501);
  }

  /**
   *
   * @param {Array} constuct object to be save
   * @param {Object} pattern Should contain a meta key used to identify the construct
   *                     If null will insert a new construct into the source
   */
  async storeBulk(constructs, pattern) {
    logger.debug("StorageJunction storeBulk");
    if (!this.capabilities.store)
      throw new StorageError(405);
    throw new StorageError(501);
  }

  /**
   * @param {*} pattern Should contain a meta key used to identify the construct.
   */
  async recall(pattern) {
    logger.debug("StorageJunction recall");
    if (!this.capabilities.store)
      throw new StorageError(405);
    throw new StorageError(501);
  }

  /**
   * @param {*} pattern can contain match, fields, .etc used to select constructs
   */
  async retrieve(pattern) {
    logger.debug("StorageJunction retrieve");
    if (!this.capabilities.query && pattern)
      throw new StorageError(405);
    throw new StorageError(501);
  }

  /**
   * pattern can contain a meta key OR a match
   */
  async dull(pattern) {
    logger.debug("StorageJunction dull");
    if (!this.capabilities.store)
      throw new StorageError(405);
    throw new StorageError(501);
  }

  ////////// object streaming //////////

  // If sub-class sets the _readerClass and _writerClass members in constructor
  // then these methods don't need to be overriden.
  createReadStream(options) {
    options = Object.assign({}, this.options, options);
    return new this._readerClass(this, options);
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
    if (!this.capabilities.filesystem)
      throw new StorageError(405);
    
    if (!this._fileSystem)
      this._fileSystem = await Cortex.FileSystems.activate(this.smt, this.options);
    return this._fileSystem;
  }

};
