/**
 * storage/cortex
 *
 * Cortex is a data directory and dictionary of encoding definitions.
 * Encoding definitions:
 *   engram - SMT encoding definitions
 *   tract - ETL tract definitions
 *
 * An underlying StorageJunction such as ElasticsearchJunction
 * can be used for permanent storage.
 * A simple cache is implemented with a Map.
 */
"use strict";

const storage = require("./index");
const { Engram, StorageError } = require("./types");
const logger = require("./utils/logger");

const cortexEncoding = require("./cortex.encoding.json");

module.exports = exports = class Cortex {

  constructor(options = {}) {
    this.options = options || {};

    this._engrams = new Map();
    this._active = false;
    this._junction = null;
  }

  get isActive() {
    return this._active;
  }

  /**
   * Activate the Cortex
   *
   * @param {*} options
   * @returns
   */
  async activate(options = {}) {
    options = Object.assign({}, this.options, options);

    try {
      if (options.smt) {
        let junctionOptions = Object.assign({}, options.options);
        if (!junctionOptions.encoding)
          junctionOptions.encoding = cortexEncoding;
        this._junction = await storage.activate(options.smt, junctionOptions);

        // attempt to create accounts schema
        let results = await this._junction.createSchema();
        if (results.resultCode === 0) {
          logger.info("created cortex schema");
        }
        else if (results.resultCode === 409) {
          logger.verbose("cortex schema exists");
        }
        else {
          throw new StorageError(500, "unable to create cortex schema");
        }
        this._active = true;
      }
    }
    catch (err) {
      logger.error('cortex activate failed: ', err);
    }

    return this._active;
  }

  async relax() {
    this._active = false;
    if (this._junction)
      await this._junction.relax();
  }

  /**
   *
   * @param {*} engram Engram or encoding object with cortex properties
   * @returns
   */
  async store(engram) {
    let results = {
      resultCode: 0,
      resultText: "OK"
    };

    let encoding = (engram instanceof Engram) ? engram.encoding : engram;

    // save in cache
    this._engrams.set(encoding.name, encoding);

    if (this._junction) {
      // save in source cortex
      results = await this._junction.store(encoding);
      logger.verbose(results.resultCode);
    }

    return results;
  }

  /**
   *
   * @param {*} name SMT name or ETL tract name
   * @returns
   */
  async dull(name) {
    let results = {
      resultCode: 0,
      resultText: "OK"
    };

    if (this._engrams.has(name)) {
      // delete from cache
      if (!this._engrams.delete(name)) {
        results.resultCode = 500;
        results.resultText = "map delete error";
      }
    }

    if (this._junction) {
      // delete from source cortex
      results = await this._junction.dull({ key: name });
    }

    return results;
  }

  /**
   *
   * @param {*} name SMT name or ETL tract name
   * @returns
   */
  async recall(name) {
    let results = {
      resultCode: 0,
      resultText: "OK",
      data: {}
    };

    if (this._engrams.has(name)) {
      // engram has been cached
      let engram = this._engrams.get(name);
      results.data[ name ] = engram;
    }
    else if (this._junction) {
      // go to the source cortex
      results = await this._junction.recall({ key: name });
      logger.verbose(results.resultCode);

      // cache engram definition
      if (results.resultCode === 0) {
        let encoding = results.data[ name ];
        this._engrams.set(name, encoding);
      }
    }
    else {
      results.resultCode = 404;
      results.resultText = "Not Found";
    }

    return results;
  }

  /**
   *
   * @param {*} pattern pattern object that contians query logic
   * @returns
   */
  async retrieve(pattern) {
    let results = {
      resultCode: 0,
      resultText: "OK"
    };

    if (this._junction) {
      // retrieve list from source cortex
      results = await this._junction.retrieve(pattern);
      logger.verbose(results.resultCode);

      // current design does not cache engrams from retrieved list
    }
    else {
      results.resultCode = 503;
      results.resultText = "Cortex Unavailable";
    }

    return results;
  }
};
