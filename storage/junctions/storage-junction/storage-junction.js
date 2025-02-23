"use strict";

const Storage = require('../../storage');
const { SMT, Engram, StorageResults, StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');

const Encoder = require('./storage-encoder');
const Reader = require('./storage-reader');
const Writer = require('./storage-writer');

const stream = require('node:stream');
const { threadId } = require('worker_threads');

module.exports = exports = class StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    encoding: false,   // get encoding from source
    reader: false,     // stream reader
    writer: false,     // stream writer
    store: false,      // store/recall individual constructs
    query: false,      // select/filter data at source
    aggregate: false,  // aggregate data at source

    filesystem: true,  // storage source is filesystem, default true
    keystore: false,   // supports key-value storage
    sql: false,        // storage source is SQL
  }

  // assign stream constructor functions, sub-class must override
  _encoderClass = Encoder;
  _readerClass = Reader;
  _writerClass = Writer;
  _fileSystem = null;

  /**
   *
   * @param {*} smt an smt string 'model|locus|schema|key', object or Engram object
   * @param {*} options
   */
  constructor(smt, options) {
    this.smt = new SMT(smt);
    this.engram = new Engram(this.smt);

    this.options = Object.assign({}, options);
    if (this.options.encoding) {
      this.engram.encoding = this.options.encoding;
    }

    this.isActive = false;

    logger.debug("StorageJunction");
  }

  static [ Symbol.hasInstance ](obj) {
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
    if (this._stfs)
      await this._stfs.relax();
  }

  async getFileSystem() {
    if (!this._stfs)
      this._stfs = await Storage.activateFileSystem(this.smt, this.options);

    return this._stfs;
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
    if (this.capabilities?.filesystem) {
      let stfs = await this.getFileSystem();
      let results = await stfs.list(options);
      return results;
    }
    else
      throw new StorageError(405);
  }

  /**
   * Get the schema's encoding.
   * If not defined, request encoding from the storage source.
   */
  async getEngram() {
    logger.debug('StorageJunction getEngram');
    if (!this.capabilities.encoding)
      throw new StorageError(405);
    return new StorageError(501);
  }

  /**
   * Create schema at the storage locus.
   * @param {object} options optional, options.schema name to use instead of junction's smt.schema
   */
  async createSchema(options = {}) {
    logger.debug('StorageJunction createSchema');
    if (!this.capabilities.encoding)
      throw new StorageError(405);
    return new StorageError(501);
  }

  /**
   * Dull schema at the storage locus.
   * Junction implementations will translate to delete file, DROP TABLE, delete index, etc.
   * @param {object} options optional, options.schema name to use instead of junction's smt.schema
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
    if (this.capabilities.filesystem) {
      let stfs = await this.getFileSystem();
      let results = await stfs.dull(options);
      return results;
    }
    else
      throw new StorageError(405);
  }

  /////////// storing & accessing //////////

  /**
   *
   * @param {object} constuct object to be save
   * @param {object} pattern Should contain a key used to identify the construct
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
   * @param {object} pattern Should contain a key used to identify the construct
   *                     If null will insert a new construct into the source
   */
  async storeBulk(constructs, pattern) {
    logger.debug("StorageJunction storeBulk");
    if (!this.capabilities.store)
      throw new StorageError(405);

    let results = new StorageResults("message", null, { stored: 0 });
    for (let construct of constructs) {
      let res = await this.store(construct);
      if (results.status !== 0)
        return res;
      results.data.stored += res.data.stored ? res.data.stored : 1;
    }

    return results;
  }

  /**
   * @param {*} pattern Should contain a key used to identify the construct.
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
   * pattern can contain a key OR a match
   */
  async dull(pattern) {
    logger.debug("StorageJunction dull");
    if (!this.capabilities.store)
      throw new StorageError(405);
    throw new StorageError(501);
  }

  ////////// streaming //////////

  // If sub-class sets the _readerClass, _writerClass and _encoderClass properties
  // then these methods don't need to be overridden.

  createReader(options) {
    if (!this.capabilities.reader)
      throw new StorageError(405);

    let opts = Object.assign({}, this.options, options);
    return new this._readerClass(this, opts);
  }

  createWriter(options) {
    if (!this.capabilities.writer)
      throw new StorageError(405);

    let opts = Object.assign({}, this.options, options);
    return new this._writerClass(this, opts);
  }

  createEncoder(options) {
    let opts = Object.assign({}, this.options, options);
    return new this._encoderClass(this, opts);
  }

  /**
   * Convert a data source's error into a StorageError
   *
   * @param {*} err a data source error object
   * @returns a new StorageError object
   */
  StorageError(err, ...params) {
    if (err instanceof StorageError)
      return err;

    // derived classes should override method
    // and implement error conversion logic

    return new StorageError(err, params);
  }
};
