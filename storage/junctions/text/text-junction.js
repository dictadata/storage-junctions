"use strict";

const { logger } = require('@dictadata/lib');

const StorageJunction = require('../storage-junction');
const Reader = require('./text-reader');
//const Writer = require('./text-writer');

module.exports = exports = class TextJunction extends StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    encoding: false,   // get encoding from source
    reader: true,      // stream reader
    writer: false,     // stream writer
    store: false,      // store/recall individual constructs
    query: false,      // select/filter data at source
    aggregate: false,  // aggregate data at source

    filesystem: true,  // storage source is filesystem, default true
    keystore: false,   // supports key-value storage
    sql: false,        // storage source is SQL
  }

  // assign stream constructor functions, sub-class must override
  //_encoderClass = Encoder;
  _readerClass = Reader;
  //_writerClass = Writer;

  /**
   *
   * @param {String|Object} smt an smt string 'model|locus|schema|key', object or Engram object
   * @param {object} options
   */
  constructor(smt, options) {
    super(smt, options);
    logger.debug("TextJunction");
  }

  // override to initialize junction
  async activate() {
    super.activate();
  }

  /**
   * override to release resources
   */
  async relax() {
    // release an resources
    super.relax();
  }

};
