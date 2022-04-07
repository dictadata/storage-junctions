/**
 * SplitterJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const Cortex = require("../../cortex");
const { Engram, StorageError } = require("../../types");
const { hasOwnProperty, logger } = require("../../utils");

const SplitterWriter = require("./splitter-writer");

const fs = require("fs");
const stream = require('stream/promises');

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

    if (!hasOwnProperty(this.options, "tract"))
      throw new StorageError(400, "tract not defined in terminal.options");
    this.split_tract = this.options.tract;
    if (!hasOwnProperty(this.split_tract, "terminal"))
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
      logger.error(err);
    }
  }

  async endTractStream() {
    for (let ss of Object.values(this.split_streams)) {
      await ss.pipes[ 0 ].end(null);
    }
  }

  async getTractStream(sname) {
    logger.debug("SplitterJunction createTract");

    if (hasOwnProperty(this.split_junctions, sname))
      return this.split_streams[ sname ].pipes[ 0 ];

    // create pipeline
    let pipes = [];

    // add transforms, if any
    if (hasOwnProperty(this.split_tract, "transform") || hasOwnProperty(this.split_tract, "transforms")) {
      let transforms = this.split_tract.transform || this.split_tract.transforms || {};
      for (let [ tfType, tfOptions ] of Object.entries(transforms)) {
        pipes.push(await this.createTransform(tfType, tfOptions));
      }
    }

    // calculate output storage schema name
    let terminal = this.split_tract.terminal;
    let split_engram = new Engram(terminal.smt);
    let smt = Object.assign({}, split_engram.smt);
    smt.schema = smt.schema.replace("*", sname);
    logger.verbose(smt.locus + smt.schema);

    // add terminal junction
    if (terminal.options && typeof terminal.options.encoding === "string") {
      // read encoding from file
      let filename = terminal.options.encoding;
      terminal.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
    }
    // attempt to create destination schema
    let junction = this.split_junctions[ sname ] = await Cortex.activate(smt, terminal.options);
    if (junction.capabilities.encoding)
      await junction.createSchema();

    pipes.push(await junction.createWriter());

    // pipeline is ready
    this.split_streams[ sname ] = {
      pipes: pipes,
      pipeline: stream.pipeline(pipes)
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
  async recall(options) {
    throw new StorageError(501);
  }

  /**
   *
   * @param {*} options options.pattern
   */
  async retrieve(options) {
    throw new StorageError(501);
  }

  /**
   *
   */
  async dull(options) {
    throw new StorageError(501);
  }

  createReader(options) {
    throw new StorageError(501);
  }

};

module.exports = SplitterJunction;
