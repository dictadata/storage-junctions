"use strict";

const StorageJunction = require("../storage");
const MongoDBReader = require("./mongodb-reader");
const MongoDBWriter = require("./mongodb-writer");
const { typeOf, StorageError } = require("../types");
const logger = require('../logger');

class MongoDBJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'mongodb|host|collection|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);

    logger.debug("MongoDBJunction");

    this._readerClass = MongoDBReader;
    this._writerClass = MongoDBWriter;
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
    logger.debug('StorageJunction list');
    options = Object.assign({}, this.options, options);
    let list = [];

    // junctions that don't use filesystems should override the list() method
    throw new StorageError({ statusCode: 501 }, "StorageJunction.list method not implemented");

    //return list;
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    try {
      if (!this.engram.isDefined) {
        // fetch form storage source
      }

      return this.engram;
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
  async createSchema(options={}) {
    logger.debug("MongoDBJunction createSchema")
    try {
      let encoding = options.encoding || this.engram.encoding;
      
      // create MongoDB collection

      // if successful update encoding
      this.engram.encoding = encoding;
      return this.engram;
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   * Dull a schema at the locus. 
   * Junction implementations will translate to delete file, DROP TABLE, delete index, etc.
   * @param {Object} options optional, options.schema name to use instead of junction's smt.schema
   */
  async dullSchema(options) {
    logger.debug('StorageJunction dullSchema');
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;

    throw new StorageError({ statusCode: 501 }, "StorageJunction.dullSchema method not implemented");
    
    // return "ok";
  }

  /**
   *
   * @param {*} construct
   * @param {*} pattern
   */
  async store(construct, pattern) {
    if (typeOf(construct) !== "object")
      throw new StorageError({ statusCode: 400 }, "Invalid parameter: construct is not an object");

    try {
      return new this.StorageResults('invalid');
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   */
  async recall(pattern) {
    if (!this.engram.smt.key) {
      throw "no storage key specified";
    }

    try {
      return new this.StorageResults('invalid');
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {

    try {
      return new this.StorageResults('invalid');
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   */
  async dull(pattern) {
    try {
      if (this.engram.smt.key) {
        // delete construct by key
      }
      else {
        // delete all constructs in the .schema
      }

      return new this.StorageResults('invalid');
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

};

//MongoDBJunction.encoder = encoder;
//MongoDBJunction.xxxEncoder = xxxEncoder;
module.exports = MongoDBJunction;
