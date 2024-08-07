/**
 * ParquetJunction
 */
"use strict";

const Storage = require('../../storage');
const StorageJunction = require('../storage-junction');
const { StorageResults, StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');

const ParquetReader = require('./parquet-reader');
const ParquetWriter = require('./parquet-writer');

const path = require('node:path');
const { pipeline, finished } = require('node:stream/promises');


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
   * @param {*} smt 'parquet|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(smt, options) {
    logger.debug("ParquetJunction");
    super(smt, options);

    // check schema's extension
    if (!this.options.schema && this.smt?.schema != '*' && path.extname(this.smt.schema) === '')
      this.options.schema = this.smt.schema + '.parquet';
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEngram() {
    logger.debug("ParquetJunction getEngram");
    if (!this.capabilities.encoding)
      throw new StorageError(405);

    try {
      if (!this.engram.isDefined) {
        // read file to infer data types
        // default to 1000 constructs unless overridden in options
        let options = Object.assign({ count: 100 }, this.options);

        let reader = this.createReader(options);
        reader.on('error', (error) => {
          logger.warn("parquet codify reader: " + error.message);
        });

        let codify = await Storage.activateTransform("codify", options);
        await pipeline(reader, codify);

        let encoding = codify.encoding;
        this.engram.encoding = encoding;
      }
      return new StorageResults("engram", null, this.engram.encoding);
    }
    catch (err) {
      let sterr = this.StorageError(err);
      logger.warn(sterr);
      throw sterr;
    }
  }

  /**
   * Sets the encoding for the storage node.
   * @param {*}
   */
  async createSchema(options = {}) {
    return super.createSchema(options);
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
   */
  async dull(pattern) {
    throw new StorageError(501);
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {
    let storageResults = new StorageResults("list");
    let rs = this.createReader(options);

    rs.on('data', (chunk) => {
      storageResults.add(chunk);
    })
    rs.on('end', () => {
      // console.log('There will be no more data.');
    });
    rs.on('error', (err) => {
      storageResults = this.StorageError(err);
    });

    await finished(rs);

    return storageResults;
  }

};

module.exports = exports = ParquetJunction;
