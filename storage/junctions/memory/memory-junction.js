// storage/junctions/memory-junction
"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResponse, StorageError } = require("../../types");
const { typeOf, logger } = require("../../utils");

const MemoryReader = require("./memory-reader");
const MemoryWriter = require("./memory-writer");
//const encoder = require('./memory-encoder');

const stream = require('stream/promises');

class MemoryJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'memory|locus|schema|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("MemoryJunction");

    this._readerClass = MemoryReader;
    this._writerClass = MemoryWriter;

    this.storage_key = this.smt.locus + "_" + this.smt.schema;
  }

  async activate() {
    this._isActive = true;
    logger.debug("MemoryJunction activate");

    try {
    }
    catch (err) {
      logger.error(err);
    }
  }

  async relax() {
    this._isActive = false;
    logger.debug("MemoryJunction relax");

    try {
    }
    catch (err) {
      logger.error(err);
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
      for (let name of MemoryJunction._storage.keys())
      if (rx.test(name))
        list.push(name);
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
    logger.debug("OracleDBJunction getEncoding");

    try {
      let entry = MemoryJunction._storage.get(this.storage_key);
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
      if (MemoryJunction._storage.has(this.storage_key))
        return new StorageResponse(409, "schema exists");
      
      if (options.encoding)
        this.engram.encoding = options.encoding;
      
      MemoryJunction._storage.set(this.storage_key, {
        engram: this.engram,
        constructs: new Map()
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
    logger.debug('OracleDBJunction dullSchema');
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    
    try {
      let entry = MemoryJunction._storage.get(this.smt.locus + schema);
      if (!entry)
        return new StorageResponse(404, "schema not found");
        
      entry.constructs.clear();
      MemoryJunction._storage.delete(this.smt.locus + schema);

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
      let entry = MemoryJunction._storage.get(this.storage_key);
      if (!entry)
        return new StorageResponse(404, "schema not found");
        
      let resultCode = 0;
      let numAffected = 0;

      let key = (pattern && pattern.key) || this.engram.get_uid(construct);
      entry.constructs[key] = construct;
      
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

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError( 400, "unique keys not supported");
    if (typeOf(constructs) !== "array")
      throw new StorageError( 400, "Invalid parameter: construct is not an object");
    
    try {
      let entry = MemoryJunction._storage.get(this.storage_key);
      if (!entry)
        return new StorageResponse(404, "schema not found");
        
      let resultCode;
      let numAffected = constructs.length;
      
      // store constructs
      for (let construct of constructs) {
        let key = this.engram.get_uid(construct);
        entry.constructs[key] = construct;
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

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError( 400, "unique keys not supported");
    
    try {
      let entry = MemoryJunction._storage.get(this.storage_key);
      if (!entry)
        return new StorageResponse(404, "schema not found");
        
      let resultCode = 0;
      let response = new StorageResponse(0);

      if (pattern && pattern.key) {
        if (entry.constructs.has(pattern.key)) {
          response.add(entry.constructs[pattern.key], pattern.key);
        }
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
      let entry = MemoryJunction._storage.get(this.storage_key);
      if (!entry)
        return new StorageResponse(404, "schema not found");
        
      let resultCode = 0;
      let response = new StorageResponse(0);

      // filter constructs using pattern
      let key = pattern.key;
      response.add(entry.constructs[key], key);

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

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError( 400, "unique keys not supported");

    try {
      let entry = MemoryJunction._storage.get(this.storage_key);
      if (!entry)
        return new StorageResponse(404, "schema not found");
        
      let resultCode = 0;
      let numAffected = 0;

      if (pattern && pattern.key) {
        if (entry.constructs.has(pattern.key)) {
          delete entry.constructs[pattern.key];
          numAffected = 1;
        }
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

MemoryJunction._storage = new Map();

// define module exports
//MemoryJunction.encoder = encoder;
module.exports = MemoryJunction;
