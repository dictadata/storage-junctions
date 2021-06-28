// storage/junctions/memory-junction
"use strict";

const StorageJunction = require("../storage-junction/storage-junction");
const { StorageResponse, StorageError } = require("../../types");
const { typeOf, logger } = require("../../utils");

const MemoryReader = require("./memory-reader");
const MemoryWriter = require("./memory-writer");
//const encoder = require('./memory-encoder');

const stream = require('stream/promises');

var _storage = new Map();

class MemoryJunction extends StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    filesystem: false, // storage source is filesystem
    sql: false,        // storage source is SQL
    keystore: true,   // supports key-value storage

    encoding: true,   // get encoding from source
    reader: true,     // stream reader
    writer: true,     // stream writer
    store: true,      // store/recall individual constructs
    query: false,      // select/filter data at source
    aggregate: false   // aggregate data at source
  }

  // assign stream constructor functions, sub-class must override
  _readerClass = MemoryReader;
  _writerClass = MemoryWriter;

  /**
   *
   * @param {*} SMT 'memory|locus|schema|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("MemoryJunction");

    this.storage_key = this.smt.locus + "_" + this.smt.schema;
    let entry = _storage.get(this.storage_key);
    if (entry) {
      this.engram = entry.engram;
      this._constructs = entry.constructs;
    }
    else {
      this._constructs = new Map();
    }
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
    logger.debug('MemoryJunction list');
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let list = [];

    try {
      let rx = '^' + this.smt.locus + '_' + schema + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      // fetch schema list from storage source
      for (let name of _storage.keys())
      if (rx.test(name))
        list.push(name.substring(this.smt.locus.length + 1));
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }

    return new StorageResponse(0, null, list);
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    logger.debug("MemoryJunction getEncoding");

    try {
      let entry = _storage.get(this.storage_key);
      if (!entry)
        return new StorageResponse(404, "schema not found");
      
      return new StorageResponse(0, null, entry.engram.encoding, "encoding");
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async createSchema(options={}) {
    logger.debug("MemoryJunction createSchema");

    try {
      if (_storage.has(this.storage_key))
        return new StorageResponse(409, "schema exists");
      
      if (options.encoding)
        this.engram.encoding = options.encoding;
      
      _storage.set(this.storage_key, {
        engram: this.engram,
        constructs: this._constructs
      });
      
      return new StorageResponse(0);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   * Dull a schema at the locus. 
   * Junction implementations will translate to delete file, DROP TABLE, delete index, etc.
   * @param {Object} options optional, options.schema name to use instead of junction's smt.schema
   */
  async dullSchema(options) {
    logger.debug('MemoryJunction dullSchema');
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    
    try {
      let entry = _storage.get(this.smt.locus + schema);
      if (!entry)
        return new StorageResponse(404, "schema not found");
        
      entry.constructs.clear();
      _storage.delete(this.smt.locus + schema);

      return new StorageResponse(0);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern) {
    logger.debug("Memory store");

    if (this.engram.keyof !== 'key')
      throw new StorageError( 400, "only keystore supported");
    if (typeOf(construct) !== "object")
      throw new StorageError(400, "Invalid parameter: construct is not an object");
    
    try {
      let resultCode = 0;
      let numAffected = 0;

      let key = (pattern && pattern.key) || this.engram.get_uid(construct);
      this._constructs.set(key, construct);
      
      return new StorageResponse(resultCode, null, numAffected, "numAffected");
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   *
   * @param {Array} constructs - array of data objects to store
   * @param {Object} pattern - optional parameters, source dependent
   */
  async storeBulk(constructs, pattern) {
    logger.debug("MemoryJunction storeBulk");

    if (this.engram.keyof !== 'key')
      throw new StorageError( 400, "only keystore supported");
    if (typeOf(constructs) !== "array")
      throw new StorageError( 400, "Invalid parameter: construct is not an object");
    
    try {
      let resultCode;
      let numAffected = constructs.length;
      
      // store constructs
      for (let construct of constructs) {
        let key = this.engram.get_uid(construct);
        this._constructs.set(key, construct);
      }

      return new StorageResponse(resultCode, null, numAffected, "numAffected");
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   *
   */
  async recall(pattern) {
    logger.debug("MemoryJunction recall");

    if (this.engram.keyof !== 'key')
      throw new StorageError( 400, "only keystore supported");
    
    try {
      let resultCode = 0;
      let response = new StorageResponse(0);

      if (pattern && pattern.key) {
        let construct = this._constructs.get(pattern.key);
        if (construct)
          response.add(construct, pattern.key);
        else
          resultCode = 404;
      }      
      else {
        // find construct using pattern
      }
      
      response.resultCode = resultCode;
      return response;
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }

  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {
    logger.debug("MemoryJunction retrieve");

    try {
      let resultCode = 0;
      let response = new StorageResponse(0);

      // filter constructs using pattern
      let key = pattern.key;
      response.add(this._constructs.get(key), key);

      response.resultCode = resultCode;
      return response;
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }

  }

  /**
   *
   */
  async dull(pattern) {
    logger.debug("MemoryJunction dull");
    if (!pattern) pattern = {};

    if (this.engram.keyof !== 'key')
      throw new StorageError( 400, "only keystore supported");

    try {
      let resultCode = 0;
      let numAffected = 0;

      if (pattern && pattern.key) {
        if (this._constructs.delete(pattern.key))
          numAffected = 1;
        else
          resultCode = 404;
      }
      else {
        // delete constructs according to pattern
      }
      
      return new StorageResponse(resultCode, null, numAffected, "numAffected");
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

};


// define module exports
//MemoryJunction.encoder = encoder;
MemoryJunction._storage = _storage;
module.exports = MemoryJunction;
