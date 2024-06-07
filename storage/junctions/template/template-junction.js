"use strict";

const { logger } = require('@dictadata/lib');

const StorageJunction = require('../storage-junction');
//const Encoder = require('./template-encoder');
//const Reader = require('./template-reader');
const Writer = require('./template-writer');

module.exports = exports = class TemplateJunction extends StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    encoding: false,   // get encoding from source
    reader: false,     // stream reader
    writer: true,      // stream writer
    store: false,      // store/recall individual constructs
    query: false,      // select/filter data at source
    aggregate: false,  // aggregate data at source

    filesystem: true,  // storage source is filesystem, default true
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
   * @param {string} options.template file path .json file to use as a template
   * @param {object} options.params name/value pairs to replace in the template, e.g. ${name}
   * @param {string} options.storeTo do notation path to the array to store constructs
   */
  constructor(smt, options) {
    super(smt, options);
    logger.debug("TemplateJunction");
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
