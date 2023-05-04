/**
 * storage/codex_store
 *
 * MODULE NOT USED
 * An attempt at a base class for codex engrams and ETL tracts.
 *
 *
 * Codex is a data directory of engram encoding definitions and transfer tracts definitions.
 * Codex acts as a data locator, data dictionary and data management repository.
 *
 * codex entry types:
 *   engram - SMT encoding definitions
 *   tract  - ETL tract definitions
 *   alias  - points to an engram of tract entry
 *
 * Uses an underlying document based StorageJunction such as ElasticsearchJunction or MongoDB for persistent storage.
 * A simple internal cache is implemented with a Map object.
 */
"use strict";

const Cortex = require("../cortex");
const { SMT, Engram, StorageResults, StorageError } = require("../types");
const { hasOwnProperty, logger } = require("../utils");
const fs = require("node:fs");
const homedir = process.env[ "HOMEPATH" ] || require('os').homedir();

const codexTypes = [ "alias", "engram", "tract" ];

module.exports = exports = class CodexStore {

  /**
   * @param { SMT }    smt an SMT string or SMT object where Codex data will be located. This parameter can NOT be an SMT name!
   * @param { Object } options that will be passed to the underlying junction.
   */
  constructor(codex_type, options) {
    this.codex_type = codex_type;

    this.smt = new SMT(options.smt);
    this.options = options.options || {};

    this._active = false;  // codex active
    this._junction = null;
    this._cache = new Map();
  }

  /**
   * Codex is active when the junctions are connected.
   */
  get isActive() {
    return this._active;
  }

  /**
   * Determine the urn to use for Codex lookups given a pattern match expression.
   *
   * @param {String|Object} match is a pattern match expression
   *   If match is a string it is the key.
   *   If match is an object that contains property named 'key' its value is used.
   *   Otherwise, use the smt.key to build a key, default is match.domain + ':' + match.name
   * @returns
   */
  urn(match) {
    let key;

    if (typeof match === "string")
      key = match;

    else if (typeof match === "object") {
      if (hasOwnProperty(match, "key"))
        key = match.key;
      else {
        // get smt.key from definition
        // format: !name1+'literal'+name2+...
        // codex key = "!domain+':'+name"
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
      ///// check to read certificate authorities from file
      // for options.tls || or options.ssl
      let tls = this.options.tls || this.options.ssl;
      if (tls?.ca) {
        if (typeof tls.ca === "string" && !tls.ca.startsWith("-----BEGIN CERTIFICATE-----")) {
          // assume it's a filename
          if (tls.ca.startsWith("~"))
            tls.ca = homedir + tls.ca.substring(1);

          // replace ca with contents of file
          logger.verbose("ca: " + tls.ca);
          tls.ca = fs.readFileSync(tls.ca);
        }
      }

      ///// create engrams junction
      let smt = Object.assign(this.smt);
      let s1 =  new SMT(smt);
      smt.key = s1.key;

      this.engrams_junction = await Cortex.activate(smt, options);

      let results = await this.engrams_junction.createSchema();
      if (results.status === 0) {
        logger.info("storage/codex: created schema, " + this.engrams_junction.smt.schema);
      }
      else if (results.status === 409) {
        logger.debug("storage/codex: schema exists");
      }
      else {
        throw new StorageError(500, "unable to create codex schema");
      }

      ///// create tracts junction
      //let smt = Object.assign(this.smt);
      let s2 =  new SMT(tracts_encoding.smt);
      smt.key = s2.key;

      this.tracts_junction = await Cortex.activate(smt, options);

      results = await this.tracts_junction.createSchema();
      if (results.status === 0) {
        logger.info("storage/codex: created schema, " + this.tracts_junction.smt.schema);
      }
      else if (results.status === 409) {
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

  /**
   * Disconnect the Codex
   */
  async relax() {
    this._active = false;
    if (this.engrams_junction)
      await this.engrams_junction.relax();
    if (this.tracts_junction)
      await this.tracts_junction.relax();
  }

  /**
   *
   * @param {*} entry Engram or encoding object with codex properties
   * @returns
   */
  async store(entry) {
    let storageResults = new StorageResults("message");

    // parameter checks
    // note: domain is optional
    if (!entry.name || entry.name === "*") {
      storageResults.setResults(400, "Invalid encoding name" );
      return storageResults;
    }
    if (!entry.type || !codexTypes.includes(entry.type)) {
      storageResults.setResults(400, "Invalid codex type" );
      return storageResults;
    }

    if (!this.engrams_junction || !this.tracts_junction) {
      storageResults.setResults(500, "Codex junction not activated");
      return storageResults;
    }

    let key = this.urn(entry);
    entry = (entry instanceof Engram) ? entry.encoding : entry;
    if (entry.type === "engram") {
      // save in cache
      this._engrams.set(key, entry);

      // save in codex
      storageResults = await this.engrams_junction.store(entry, { key: key });
      logger.verbose("storage/codex: " + key + ", " + storageResults.status);
      return storageResults;
    }

    else if (entry.type === "tract") {
      // save in cache
      this._tracts.set(key, entry);

      // save in codex
      storageResults = await this.tracts_junction.store(entry, { key: key });
      logger.verbose("storage/codex: " + key + ", " + storageResults.status);
      return storageResults;
    }
  }

  /**
   *
   * @param {*} name SMT name or ETL tract name
   * @returns
   */
  async dull(pattern) {
    let storageResults = new StorageResults("message");

    if (!this.engrams_junction || !this.tracts_junction) {
      storageResults.setResults(500, "Codex junction not activated");
      return storageResults;
    }

    let match = (typeof pattern === "object") ? (pattern.match || pattern) : pattern;
    let key = this.urn(match);

    if (pattern.type === "tract") {

    }
    else {
      if (this._engrams.has(key)) {
        // delete from cache
        if (!this._engrams.delete(key)) {
          storageResults.setResults(500, "map delete error");
          return storageResults;
        }
      }

      // delete from source codex
      storageResults = await this._junction.dull({ key: key });
      return storageResults;
    }

  }

  /**
   *
   * @param {*} name SMT name or ETL tract name
   * @returns
   */
  async recall(pattern) {
    let storageResults = new StorageResults("map");

    let match = (typeof pattern === "object") ? (pattern.match || pattern) : pattern;
    let key = this.urn(match);

    if (this._engrams.has(key)) {
      // entry has been cached
      let entry = this._engrams.get(key);
      storageResults.add(entry, key);
    }
    else if (this._junction) {
      // go to the source codex
      storageResults = await this._junction.recall({ key: key });
      logger.verbose("storage/codex: recall, " + storageResults.status);
    }
    else {
      storageResults.setResults(404, "Not Found");
    }

    if (storageResults.status === 0 && pattern.resolve) {
      // check for alias smt
      let encoding = storageResults.data[ key ];
      if (encoding.type === "alias") {
        // recall the entry for the source urn
        let results = await this.recall({
          match: {
            key: encoding.source
          },
          resolve: false
        });
        if (results.status === 0)
          storageResults.data[ key ] = results.data[ encoding.source ];
      }
    }

    if (storageResults.status === 0 && !pattern.resolve) {
      // cache entry definition
      let encoding = storageResults.data[ key ];
      if (key === this.urn(encoding)) // double check it wasn't an alias lookup
        this._engrams.set(key, encoding);
    }

    return storageResults;
  }

  /**
   *
   * @param {*} pattern pattern object that contains query logic
   * @returns
   */
  async retrieve(pattern) {
    let storageResults = new StorageResults("message");

    if (this._junction) {
      // current design does not cache entries from retrieved list

      // retrieve list from source codex
      storageResults = await this._junction.retrieve(pattern);
      logger.verbose("storage/codex: retrieve, " + storageResults.status);
    }
    else {
      storageResults.setResults(503, "Codex Unavailable");
    }

    return storageResults;
  }
};
