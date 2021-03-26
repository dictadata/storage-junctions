/**
 * SplitterJunction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const Cortex = require("../../cortex");
const { Engram, StorageError } = require("../../types");
const { hasOwnProperty } = require("../../utils");
const logger = require("../../logger");

const SplitterWriter = require("./splitter-writer");

const fs = require("fs");
const stream = require('stream/promises');

class SplitterJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'shp|folder|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    logger.debug("SplitterJunction");
    super(SMT, options);

    this._writerClass = SplitterWriter;

    if (!hasOwnProperty(this.options, "tract"))
      throw new StorageError( 400, "tract not defined in terminal.options");
    this.split_tract = this.options.tract;
    if (!hasOwnProperty(this.split_tract, "terminal"))
      throw new StorageError( 400, "terminal not defined in terminal.options.tract");

    this.split_junctions = {};
    this.split_streams = {};
  }

  async activate() {
    logger.debug("SplitterJunction activate");
    this._isActive = true;
  }

  async relax() {
    logger.debug("SplitterJunction relax");
    this._isActive = false;

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
      await ss.pipes[0].end(null);
    }
  }

  async getTractStream(sname) {
    logger.debug("SplitterJunction createTract");

    if (hasOwnProperty(this.split_junctions,sname))
      return this.split_streams[sname].pipes[0];

    // create pipeline
    let pipes = [];

    // add transforms, if any
    if (hasOwnProperty(this.split_tract, "transforms")) {
      for (let [tfType, tfOptions] of Object.entries(this.split_tract.transforms)) {
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
    let junction = this.split_junctions[sname] = await Cortex.activate(smt, terminal.options);
    await junction.createSchema();

    pipes.push(await junction.createWriteStream());

    // pipeline is ready
    this.split_streams[sname] = {
      pipes: pipes,
      pipeline: stream.pipeline(pipes)
    }
    return pipes[0];
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

  createReadStream(options) {
    throw new StorageError(501);
  }

};

module.exports = SplitterJunction;
