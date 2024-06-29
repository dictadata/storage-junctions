"use strict";

const { logger } = require('@dictadata/lib');

const StorageJunction = require('../storage-junction');
//const Encoder = require('./null-encoder');
//const Reader = require('./null-reader');
const Writer = require('./null-writer');

module.exports = exports = class NullJunction extends StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    encoding: false,   // get encoding from source
    reader: false,     // stream reader
    writer: true,      // stream writer
    store: false,      // store/recall individual constructs
    query: false,      // select/filter data at source
    aggregate: false,  // aggregate data at source

    filesystem: false,  // storage source is filesystem, default true
    keystore: false,   // supports key-value storage
    sql: false,        // storage source is SQL
  }

  // assign stream constructor functions, sub-class must override
  //_encoderClass = Encoder;
  //_readerClass = Reader;
  _writerClass = Writer;

  /**
   *
   * @param {String|Object} smt an smt string 'model|locus|schema|key', object or Engram object
   * @param {object} options
   */
  constructor(smt, options) {
    super(smt, options);
    logger.debug("NullJunction");
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
