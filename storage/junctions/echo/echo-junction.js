/**
 * EchoJunction
 */
"use strict";

const StorageJunction = require('../storage-junction');
const EchoReader = require('./echo-reader');
const EchoWriter = require('./echo-writer');
const { StorageError } = require('../../types');
const { typeOf } = require('@dictadata/lib/utils');
const { logger } = require('@dictadata/lib');

class EchoJunction extends StorageJunction {

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
  _readerClass = EchoReader;
  _writerClass = EchoWriter;

  /**
   *
   * @param {*} smt smt string or smt object
   * @param {*} options
   */
  constructor(smt, options) {
    logger.debug("new EchoJunction");
    super(smt, options);
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern) {
    if (typeOf(construct) !== "object")
      throw new StorageError(400, "Invalid parameter: construct is not an object");

    throw new StorageError(501);
  }

  /**
   *
   */
  async recall(pattern) {
    if (!this.engram.smt.key)
      throw new StorageError(400, "no storage key specified");

    throw new StorageError(501);
  }

  /**
   *
   * @param {*} pattern Object containing match, filter and cue elements
   */
  async retrieve(pattern) {
    throw new StorageError(501);
  }

  /**
   *
   */
  async dull(pattern) {
    if (this.engram.smt.key) {
      // delete construct by key
    }
    else {
      // delete all constructs in the .schema
    }

    throw new StorageError(501);
  }

};

module.exports = exports = EchoJunction;
