/**
 * storage/codex
 *
 * Codex is a data directory and dictionary of encoding definitions.
 * Encoding definitions:
 *   engram - SMT encoding definitions
 *   tract  - ETL tract definitions
 *
 * An underlying StorageJunction such as ElasticsearchJunction
 * can be used for permanent storage.
 * A simple cache is implemented with a Map.
 */
"use strict";

const Cortex = require("./cortex");
const { Engram, StorageError } = require("./types");
const logger = require("./utils/logger");

const codexEncoding = require("./codex.encoding.json");

const codexTypes = [ "engram", "tract", "alias" ];

module.exports = exports = class Codex {

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
   * Activate the Codex
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
          junctionOptions.encoding = codexEncoding;
        this._junction = await Cortex.activate(options.smt, junctionOptions);

        // attempt to create codex schema
        let results = await this._junction.createSchema();
        if (results.resultCode === 0) {
          logger.info("storage/codex: created schema, " + this._junction.smt.schema);
        }
        else if (results.resultCode === 409) {
          logger.verbose("storage/codex: schema exists");
        }
        else {
          throw new StorageError(500, "unable to create codex schema");
        }
        this._active = true;
      }
    }
    catch (err) {
      logger.error('storge/codex: activate failed, ', err.message || err);
    }

    return this._active;
  }

  async relax() {
    this._active = false;
    if (this._junction)
      await this._junction.relax();
  }

  _getkey(pattern) {
    let key = pattern; // assume typeof string

    if (typeof key === "object") {
      if (pattern.key)
        key = pattern.key;
      else
        key = (pattern.domain) ? pattern.domain + '_' + pattern.name : pattern.name;
    }

    return key;
  }

  /**
   *
   * @param {*} entry Engram or encoding object with codex properties
   * @returns
   */
  async store(entry) {
    let results = {
      resultCode: 0,
      resultText: "OK"
    };

    if (!entry.name || entry.name === "*") {
      results.resultCode = 400;
      results.resultText = "Invalid encoding name";
      return results;
    }
    if (!entry.type || !codexTypes.includes(entry.type)) {
      results.resultCode = 400;
      results.resultText = "Invalid codex type";
      return results;
    }

    let encoding = (entry instanceof Engram) ? entry.encoding : entry;
    let key = this._getkey(encoding);

    // save in cache
    this._engrams.set(key, encoding);

    if (this._junction) {
      // save in source codex
      results = await this._junction.store(encoding, { key: key });
      logger.verbose("storage/codex: " + key + ", " + results.resultCode);
    }

    return results;
  }

  /**
   *
   * @param {*} name SMT name or ETL tract name
   * @returns
   */
  async dull(pattern) {
    let results = {
      resultCode: 0,
      resultText: "OK"
    };
    let key = this._getkey(pattern);

    if (this._engrams.has(key)) {
      // delete from cache
      if (!this._engrams.delete(key)) {
        results.resultCode = 500;
        results.resultText = "map delete error";
      }
    }

    if (this._junction) {
      // delete from source codex
      results = await this._junction.dull({ key: key });
    }

    return results;
  }

  /**
   *
   * @param {*} name SMT name or ETL tract name
   * @returns
   */
  async recall(pattern, options = {}) {
    let results = {
      resultCode: 0,
      resultText: "OK",
      data: {}
    };

    let key = this._getkey(pattern);

    if (this._engrams.has(key)) {
      // entry has been cached
      let entry = this._engrams.get(key);
      results.data[ key ] = entry;
    }
    else if (this._junction) {
      // go to the source codex
      results = await this._junction.recall({ key: key });
      logger.verbose("storage/codex: recall, " + results.resultCode);

      if (options.resolve && results.resultCode === 0) {
        // check for alias smt
        let encoding = results.data[ name ];
        if (encoding.type === "alias") {
          // recall the entry for the smt_name in source
          results = await this._junction.recall({ key: encoding.source });
          if (results.resultCode === 0)
            results.data[ name ] = results.data[ encoding.source ];
        }
      }

      if (results.resultCode === 0 && !options.resolve) {
        // cache entry definition
        let encoding = results.data[ name ];
        if (name === encoding.name) // double check it wasn't an alias lookup
          this._engrams.set(key, encoding);
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
      // retrieve list from source codex
      results = await this._junction.retrieve(pattern);
      logger.verbose("storage/codex: retrieve, " + results.resultCode);

      // current design does not cache entries from retrieved list
    }
    else {
      results.resultCode = 503;
      results.resultText = "Codex Unavailable";
    }

    return results;
  }
};
