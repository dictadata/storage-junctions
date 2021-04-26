"use strict";

const StorageJunction = require("../storage-junction");
const MongoDBReader = require("./mongodb-reader");
const MongoDBWriter = require("./mongodb-writer");
const { StorageResponse, StorageError } = require("../../types");
const { typeOf, logger } = require("../../utils");

//const MongoDB = require('mongodb');

class MongoDBJunction extends StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    filesystem: false, // storage source is filesystem
    sql: false,        // storage source is SQL
    keystore: false,   // supports key-value storage

    encoding: true,   // get encoding from source
    reader: true,     // stream reader
    writer: true,     // stream writer
    store: true,      // store/recall individual constructs
    query: true,      // select/filter data at source
    aggregate: true   // aggregate data at source
  }

  // assign stream constructor functions, sub-class must override
  _readerClass = MongoDBReader;
  _writerClass = MongoDBWriter;

  /**
   *
   * @param {*} SMT 'mongodb|host|collection|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);

    logger.debug("MongoDBJunction");
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
    throw new StorageError(501);

    //return new StorageResponse(0, null, list);
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

      return new StorageResponse(0, null, this.engram.encoding, "encoding");
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
      return new StorageResponse(0);
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

    throw new StorageError(501);
    
    // return "ok";
  }

  /**
   *
   * @param {*} construct
   * @param {*} pattern
   */
  async store(construct, pattern) {
    if (typeOf(construct) !== "object")
      throw new StorageError(400, "construct is not an object");

    try {
      throw new StorageError(501);
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
      throw new StorageError(501);
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
      throw new StorageError(501);
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

      throw new StorageError(501);
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
