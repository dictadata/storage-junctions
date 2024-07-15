/**
 * SplitterJunction
 * // DEPRECATED implemented in tracts
 */
"use strict";

const Storage = require('../../storage');
const StorageJunction = require('../storage-junction');
const { Engram, StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');

const SplitterWriter = require('./splitter-writer');

const { readFile } = require('node:fs/promises');
const { pipeline } = require('node:stream/promises');

class SplitterJunction extends StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    filesystem: false, // storage source is filesystem
    sql: false,        // storage source is SQL
    keystore: false,   // supports key-value storage

    encoding: false,   // get encoding from source
    reader: false,     // stream reader
    writer: true,     // stream writer
    store: false,      // store/recall individual constructs
    query: false,      // select/filter data at source
    aggregate: false   // aggregate data at source
  }

  // assign stream constructor functions, sub-class must override
  //_readerClass = SplitterReader;
  _writerClass = SplitterWriter;

  /**
   *
   * @param {*} smt 'shp|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(smt, options) {
    logger.debug("SplitterJunction");
    super(smt, options);

    this._writerClass = SplitterWriter;

    if (!Object.hasOwn(this.options, "tract"))
      throw new StorageError(400, "tract not defined in terminal.options");
    this.split_tract = this.options.tract;
    if (!Object.hasOwn(this.split_tract, "terminal"))
      throw new StorageError(400, "terminal not defined in terminal.options.tract");

    this.split_junctions = {};
    this.split_streams = {};
  }

  async activate() {
    logger.debug("SplitterJunction activate");
    this.isActive = true;
  }

  async relax() {
    logger.debug("SplitterJunction relax");
    this.isActive = false;

    try {
      // release any allocated storage junctions
      for (let junction of Object.values(this.split_junctions)) {
        await junction.relax();
      }
    }
    catch (err) {
      logger.warn(err.message);
    }
  }

  async endTractStream() {
    for (let ss of Object.values(this.split_streams)) {
      await ss.pipes[ 0 ].end(null);
    }
  }

  async getTractStream(sname) {
    logger.debug("SplitterJunction createTract");

    if (Object.hasOwn(this.split_junctions, sname))
      return this.split_streams[ sname ].pipes[ 0 ];

    // create pipeline
    let pipes = [];

    // add transforms, if any
    if (Object.hasOwn(this.split_tract, "transforms")) {
      let transforms = this.split_tract.transforms || [];
      for (let transform of transforms) {
        pipes.push(await Storage.activateTransform(transform.transform, transform));
      }
    }

    // calculate output storage schema name
    let terminal = this.split_tract.terminal;
    let split_engram = new Engram(terminal.smt);
    let smt = Object.assign({}, split_engram.smt);
    smt.schema = smt.schema.replace("*", sname);
    logger.verbose(smt.locus + smt.schema);

    // add terminal junction
    if (typeof terminal.options?.encoding === "string") {
      // read encoding from file
      let filename = terminal.options.encoding;
      terminal.options.encoding = JSON.parse(await readFile(filename, "utf8"));
    }
    // attempt to create destination schema
    let junction = this.split_junctions[ sname ] = await Storage.activate(smt, terminal.options);
    if (junction.capabilities.encoding)
      await junction.createSchema();

    let writer = await junction.createWriter();
    writer.on('error', (error) => {
      logger.warn("splitter-junction writer: " + error.message);
    });
    pipes.push(writer);

    // pipeline is ready
    this.split_streams[ sname ] = {
      pipes: pipes,
      pipeline: pipeline(pipes)
    }
    return pipes[ 0 ];
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern) {
    throw new StorageError(501);
  }

  async list(options) {
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

  createReader(options) {
    throw new StorageError(501);
  }

};

module.exports = exports = SplitterJunction;
