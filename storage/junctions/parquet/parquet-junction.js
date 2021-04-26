/**
 * ParquetJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResponse, StorageError } = require("../../types");
const { logger } = require('../../utils');

const ParquetReader = require("./parquet-reader");
const ParquetWriter = require("./parquet-writer");

const path = require('path');
const stream = require('stream/promises');


class ParquetJunction extends StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    filesystem: true, // storage source is filesystem
    sql: false,        // storage source is SQL
    keystore: false,   // supports key-value storage

    encoding: false,   // get encoding from source
    reader: true,     // stream reader
    writer: true,     // stream writer
    store: false,      // store/recall individual constructs
    query: false,      // select/filter data at source
    aggregate: false   // aggregate data at source
  }

  // assign stream constructor functions, sub-class must override
  _readerClass = ParquetReader;
  _writerClass = ParquetWriter;

  /**
   *
   * @param {*} SMT 'parquet|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    logger.debug("ParquetJunction");
    super(SMT, options);

    // check schema's extension
    if (!this.options.schema && this.smt.schema && this.smt.schema != '*' && path.extname(this.smt.schema) === '')
      this.options.schema = this.smt.schema + '.parquet';
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEncoding() {

    try {
      if (!this.engram.isDefined) {
        // read file to infer data types
        // default to 1000 constructs unless overridden in options
        let options = Object.assign({ max_read: 100 }, this.options);
        let reader = this.createReadStream(options);
        let codify = this.createTransform('codify', options);

        await stream.pipeline(reader, codify);
        let encoding = codify.encoding;
        this.engram.encoding = encoding;
      }
      return new StorageResponse(0, null, this.engram.encoding, "encoding");
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   * Sets the encoding for the storage node.
   * @param {*} 
   */
  async createSchema(options={}) {
    return super.createSchema(options);
  }

  /**
  * Return list of schema names found in the data source like files or tables.
  * The smt.schema or options.schema should contain a wildcard character *.
  * If options.forEach is defined it is called for each schema found.
  * Returns list of schemas found.
  * @param {*} options list options
  */
  async list(options) {
    logger.debug('ParquetJunction list');
    let stfs = await this.getFileSystem();
    let list = await stfs.list(options);
    return new StorageResponse(0, null, list);
  }


  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern) {
    logger.debug("ParquetJunction store");
    throw new StorageError(501);
  }

  /**
   *
   */
  async recall(pattern) {
    throw new StorageError(501);
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {
    throw new StorageError(501);
  }

  /**
   *
   */
  async dull(pattern) {
    throw new StorageError(501);
  }

};

module.exports = ParquetJunction;
