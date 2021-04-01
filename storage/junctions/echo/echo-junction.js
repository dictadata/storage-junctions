/**
 * EchoJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const EchoReader = require("./echo-reader");
const EchoWriter = require("./echo-writer");
const { StorageError } = require("../../types");
const { typeOf } = require("../../utils");
const { logger } = require('../../utils');

class EchoJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT smt string or smt object
   * @param {*} options
   */
  constructor(SMT, options) {
    logger.debug("new EchoJunction");
    super(SMT, options);

    // override stream constructor functions
    this._readerClass = EchoReader;
    this._writerClass = EchoWriter;
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

module.exports = EchoJunction;
