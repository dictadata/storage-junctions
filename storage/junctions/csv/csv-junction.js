/**
 * CSVJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResponse, StorageError } = require("../../types");
const { logger } = require("../../utils");
const CSVReader = require("./csv-reader");
const CSVWriter = require("./csv-writer");

const path = require('path');
const stream = require('stream/promises');


class CSVJunction extends StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    filesystem: true,  // storage source is filesystem
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
  _readerClass = CSVReader;
  _writerClass = CSVWriter;

  /**
   *
   * @param {*} smt 'csv|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(smt, options) {
    super(smt, options);
    logger.debug("CSVJunction");

    // check schema's extension
    //if (!this.options.schema && this.smt.schema && this.smt.schema != '*' && path.extname(this.smt.schema) === '')
    //  this.options.schema = this.smt.schema + '.csv';

    // this.options.header = false;  // default value
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEncoding() {
    logger.debug("CSVJunction get encoding");

    try {
      if (!this.engram.isDefined) {
        // read the file to infer data types
        // default to 100 constructs unless overridden in options
        let options = Object.assign({ max_read: 100 }, this.options);

        let reader = this.createReader(options);
        reader.on('error', (error) => {
          logger.error("csv codify reader: " + error.message);
        });

        let codify = await this.createTransform("codify", options);
        await stream.pipeline(reader, codify);

        let encoding = codify.encoding;
        this.engram.encoding = encoding;
      }
      return new StorageResponse("encoding", "", this.engram.encoding);
    }
    catch (err) {
      if (e instanceof StorageError)
        throw err;
      logger.error(err);
      throw new StorageError(500).inner(err);
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
   * @param {*} pattern
   */
  async store(construct, pattern) {
    logger.debug("CSVJunction store");
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
    let storageResponse = new StorageResponse("list");
    let rs = this.createReader({ pattern: pattern });

    rs.on('data', (chunk) => {
      storageResponse.add(chunk);
    })
    rs.on('end', () => {
      // console.log('There will be no more data.');
      storageResponse.setResults(0);
    });
    rs.on('error', (err) => {
      storageResponse = new StorageError(500).inner(err);
    });

    await stream.finished(rs);

    return storageResponse;
  }

};

module.exports = CSVJunction;
