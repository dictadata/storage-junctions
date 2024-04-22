/**
 * ShapefileJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResults, StorageError } = require("../../types");
const { logger } = require("../../utils");

const ShapefileReader = require("./shapefile-reader");
const ShapefileWriter = require("./shapefile-writer");

const { pipeline, finished } = require('node:stream/promises');
const shapefile = require('shapefile');

class ShapefileJunction extends StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    filesystem: true,  // storage source is filesystem
    sql: false,        // storage source is SQL
    keystore: false,   // supports key-value storage

    encoding: false,   // get encoding from source
    reader: true,      // stream reader
    writer: true,      // stream writer
    store: false,      // store/recall individual constructs
    query: false,      // select/filter data at source
    aggregate: false   // aggregate data at source
  }

  // assign stream constructor functions, sub-class must override
  _readerClass = ShapefileReader;
  _writerClass = ShapefileWriter;

  /**
   *
   * @param {*} smt 'shp|folder|schema|key' or an Engram object
   * @param {*} options
   */
  constructor(smt, options) {
    logger.debug("ShapefileJunction");
    super(smt, options);
  }

  // override to initialize junction
  async activate() {
    super.activate();

    if (this.smt.locus.startsWith("zip:") && this.smt.schema === "$1") {
      // find first .shp file in .zip file
      let stfs = await this.getFileSystem();
      let list = await stfs.list({ schema: "*.shp", recursive: true });
      if (list.data[ "0" ]) {
        let entry = list.data[ "0" ];
        this.smt.schema = this.engram.name = entry.name.substring(0, entry.name.length - 4);

        let pl = entry.rpath.length - entry.name.length;
        if (pl > 0)
          stfs.prefix += entry.rpath.substring(0, pl);
        //this.smt.locus += "/" + stfs.prefix;
      }
    }
  }

  /**
   *  Get the encoding for the storage junction.
   */
  async getEngram() {
    logger.debug("ShapefileJunction getEncoding");
    if (!this.capabilities.encoding)
      throw new StorageError(405);

    try {
      if (!this.engram.isDefined) {
        // read file to infer data types
        // default to 100 constructs unless overridden in options
        let options = Object.assign({ max_read: 100 }, this.options);

        let reader = this.createReader(options);
        reader.on('error', (error) => {
          logger.warn("shapefile codify reader: " + error.message);
        });

        let codify = await this.createTransform("codify", options);
        await pipeline(reader, codify);

        let encoding = codify.encoding;
        this.engram.encoding = encoding;
      }
      return new StorageResults("engram", null, this.engram.encoding);
    }
    catch (err) {
      logger.warn(err.message);
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
    logger.debug("ShapefileJunction store");
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

module.exports = exports = ShapefileJunction;
