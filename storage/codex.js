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
const { SMT, Engram, StorageError } = require("./types");
const logger = require("./utils/logger");

const codex_encoding = require("./codex.encoding.json");
const { hasOwnProperty } = require("./utils");

const codexTypes = [ "engram", "tract", "alias" ];

module.exports = exports = class Codex {

  /**
   * @param { SMT }    smt an SMT string or SMT object where Codex data will be located. This parameter can NOT be an SMT name.
   * @param { Object } options that will be passed to the underlying junction.
   */
  constructor(smt, options) {
    this.smt = new SMT(smt);
    this.options = options || {};

    this._engrams = new Map();
    this._active = false;
    this._junction = null;
  }

  get isActive() {
    return this._active;
  }

  smt_urn(match) {
    let key;

    if (typeof match === "string")
      key = match;

    else if (typeof match === "object") {
      if (hasOwnProperty(match, "key"))
        key = match.key;
      else {
        // get key using smt.key definition
        //   |.|.|.|=name1+'literal'+name2+...
        //   |.|.|.|!name1+'literal'+name2+...
        key = '';
        let keys = this.smt.key.substring(1).split('+');
        for (let kname of keys) {
          if (kname && kname[ 0 ] === "'") {
            key += kname.substr(1, kname.length - 2);  // strip quotes
          }
          else {
            if (hasOwnProperty(match, kname) && match[ kname ])
              key += match[ kname ];
          }
        }
      }
    }

    return key;
  }

  /**
   * Activate the Codex
   *
   * @returns true if underlying junction was activated successfully
   */
  async activate() {

    try {
      let options = Object.assign({}, this.options);
      if (!options.encoding)
        options.encoding = codex_encoding;

      if (this.smt.key === "*") {
        // use default smt.key
        let s = new SMT(codex_encoding.smt);
        this.smt.key = s.key;
      }

      // create the junction
      this._junction = await Cortex.activate(this.smt, options);

      // attempt to create codex schema
      let results = await this._junction.createSchema();
      if (results.resultCode === 0) {
        logger.info("storage/codex: created schema, " + this._junction.smt.schema);
      }
      else if (results.resultCode === 409) {
        logger.debug("storage/codex: schema exists");
      }
      else {
        throw new StorageError(500, "unable to create codex schema");
      }
      this._active = true;
    }
    catch (err) {
      logger.error('storage/codex: activate failed, ', err.message || err);
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
   * @param {*} entry Engram or encoding object with codex properties
   * @returns
   */
  async store(entry) {
    let results = {
      resultCode: 0,
      resultMessage: "OK"
    };

    // parameter checks
    // note: domain is optional
    if (!entry.name || entry.name === "*") {
      results.resultCode = 400;
      results.resultMessage = "Invalid encoding name";
      return results;
    }
    if (!entry.type || !codexTypes.includes(entry.type)) {
      results.resultCode = 400;
      results.resultMessage = "Invalid codex type";
      return results;
    }

    let encoding = (entry instanceof Engram) ? entry.encoding : entry;
    let key = this.smt_urn(encoding);

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
      resultMessage: "OK"
    };

    let match = (typeof pattern === "object") ? (pattern.match || pattern) : pattern;
    let key = this.smt_urn(match);

    if (this._engrams.has(key)) {
      // delete from cache
      if (!this._engrams.delete(key)) {
        results.resultCode = 500;
        results.resultMessage = "map delete error";
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
  async recall(pattern) {
    let results = {
      resultCode: 0,
      resultMessage: "OK",
      data: {}
    };

    let match = (typeof pattern === "object") ? (pattern.match || pattern) : pattern;
    let key = this.smt_urn(match);

    if (this._engrams.has(key)) {
      // entry has been cached
      let entry = this._engrams.get(key);
      results.data[ key ] = entry;
    }
    else if (this._junction) {
      // go to the source codex
      results = await this._junction.recall({ key: key });
      logger.verbose("storage/codex: recall, " + results.resultCode);
    }
    else {
      results.resultCode = 404;
      results.resultMessage = "Not Found";
    }

    if (results.resultCode === 0 && pattern.resolve) {
      // check for alias smt
      let encoding = results.data[ key ];
      if (encoding.type === "alias") {
        // recall the entry for the source smt_urn
        results = await this.recall({
          match: {
            key: encoding.source
          },
          resolve: false
        });
        if (results.resultCode === 0)
          results.data[ key ] = results.data[ encoding.source ];
      }
    }

    if (results.resultCode === 0 && !pattern.resolve) {
      // cache entry definition
      let encoding = results.data[ key ];
      if (key === this.smt_urn(encoding)) // double check it wasn't an alias lookup
        this._engrams.set(key, encoding);
    }

    return results;
  }

  /**
   *
   * @param {*} pattern pattern object that contains query logic
   * @returns
   */
  async retrieve(pattern) {
    let results = {
      resultCode: 0,
      resultMessage: "OK"
    };

    if (this._junction) {
      // retrieve list from source codex
      results = await this._junction.retrieve(pattern);
      logger.verbose("storage/codex: retrieve, " + results.resultCode);

      // current design does not cache entries from retrieved list
    }
    else {
      results.resultCode = 503;
      results.resultMessage = "Codex Unavailable";
    }

    return results;
  }
};
