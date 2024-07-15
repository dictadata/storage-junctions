/**
 * JSONJunction
 */
"use strict";

const Storage = require('../../storage');
const StorageJunction = require('../storage-junction');
const { StorageResults, StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');
const JSONReader = require('./json-reader');
const JSONWriter = require('./json-writer');

const path = require('node:path');
const { pipeline, finished } = require('node:stream/promises');


class JSONJunction extends StorageJunction {

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
  _readerClass = JSONReader;
  _writerClass = JSONWriter;

  /**
   *
   * @param {*} smt 'json|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(smt, options) {
    logger.debug("JSONJunction");
    super(smt, options);

    // check schema's extension
    //if (!this.options.schema && this.smt.schema && this.smt.schema != '*' && path.extname(this.smt.schema) === '')
    //  this.options.schema = this.smt.schema + '.json';
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEngram() {
    logger.debug("JSONJunction getEngram");
    if (!this.capabilities.encoding)
      throw new StorageError(405);

    try {
      if (!this.engram.isDefined) {
        // read file to infer data types
        // default to 100 constructs unless overridden in options
        let options = Object.assign({ count: 100 }, this.options);

        let reader = this.createReader(options);
        reader.on('error', (error) => {
          logger.warn(`json codify reader: ${error.message}`);
        });

        let codify = await Storage.activateTransform("codify", options);
        await pipeline(reader, codify);

        let encoding = codify.encoding;
        this.engram.encoding = encoding;
      }

      return new StorageResults("engram", null, this.engram.encoding);
    }
    catch (err) {
      if (err instanceof StorageError)
        throw err;
      // logger.warn(err);
      throw this.StorageError(err);
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
    logger.debug("JSONJunction store");
    throw new StorageError(501);
  }

  /**
   *
   */
  async recall(options) {
    throw new StorageError(501);
  }

  /**
   *
   */
  async dull(options) {
    throw new StorageError(501);
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {
    let storageResults = new StorageResults("list");
    let rs = this.createReader({ pattern: pattern });

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

module.exports = exports = JSONJunction;
