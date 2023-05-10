/**
 * storage/cortex
 *
 * Storage Cortex is a datastore for ETL tracts definitions.
 *
 * tract types:
 *   tract  - ETL tract definitions
 *   alias  -
 *
 * An underlying StorageJunction such as ElasticsearchJunction can be used for persistent storage.
 * A simple cache is implemented with a Map.
 */
"use strict";

const Campus = require("../campus");
const { SMT, StorageResults, StorageError } = require("../types");
const { hasOwnProperty, logger } = require("../utils");
const fs = require("node:fs");
const homedir = process.env[ "HOMEPATH" ] || require('os').homedir();

const cortex_encoding = require("./cortex.encoding.json");

const codexTypes = [ "tract", "alias" ];

module.exports = exports = class Cortex {

  /**
   * @param { SMT }    smt an SMT string or SMT object where tracts data will be located. This parameter can NOT be an SMT name!
   * @param { Object } options that will be passed to the underlying junction.
   */
  constructor(smt, options) {
    this.smt = new SMT(smt);
    this.options = options || {};

    this._cortex = new Map();
    this._active = false;
    this._junction = null;
  }

  get isActive() {
    return this._active;
  }

  urn(entry) {
    let urn;
    if (typeof entry === "string")
      urn = entry;
    else if (entry.key)
      urn = entry.key;
    else
      urn = entry.domain + ":" + entry.name;
    return urn;
  }

  /**
   * Activate the Cortex junction
   *
   * @returns true if underlying junction was activated successfully
   */
  async activate() {

    try {
      let options = Object.assign({}, this.options);
      if (!options.encoding)
        options.encoding = cortex_encoding;

      if (this.smt.key === "*") {
        // use default smt.key which is !domain+name
        let s = new SMT(cortex_encoding.smt);
        this.smt.key = s.key;
      }

      // check to read certificate authorities from file
      let tls = options.tls || options.ssl;
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

      // create the junction
      this._junction = await Campus.activate(this.smt, options);

      // attempt to create cortex schema
      let results = await this._junction.createSchema();
      if (results.status === 0) {
        logger.info("storage/cortex: created schema, " + this._junction.smt.schema);
      }
      else if (results.status === 409) {
        logger.debug("storage/cortex: schema exists");
      }
      else {
        throw new StorageError(500, "unable to create cortex schema");
      }
      this._active = true;
    }
    catch (err) {
      logger.error('storage/cortex: activate failed, ', err.message || err);
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
   * @param {*} entry object with tracts' properties
   * @returns
   */
  async store(entry) {
    let storageResults = new StorageResults("message");

    // parameter checks
    // note: domain is optional
    if (!entry.name || entry.name === "*") {
      storageResults.setResults(400, "Invalid cortex name" );
      return storageResults;
    }
    if (!entry.type || !codexTypes.includes(entry.type)) {
      storageResults.setResults(400, "Invalid codex type" );
      return storageResults;
    }

    let key = this.urn(entry);

    // make sure smt are strings
    if (entry.type === "tract") {
      for (let tract of entry?.tracts) {
        if (typeof tract.origin?.smt === "object") {
          let smt = new SMT(tract.origin.smt);
          tract.origin.smt = smt.toString();
        }
        if (typeof tract.terminal?.smt === "object") {
          let smt = new SMT(tract.terminal.smt);
          tract.terminal.smt = smt.toString();
        }
      }
    }

    // save in cache
    this._cortex.set(key, entry);

    if (this._junction) {
      // save in source cortex
      storageResults = await this._junction.store(entry, { key: key });
      logger.verbose("storage/cortex: " + key + ", " + storageResults.status);
      return storageResults;
    }

    storageResults.setResults(500, "Cortex junction not activated");
    return storageResults;
  }

  /**
   *
   * @param {*} name SMT name or ETL tracts name
   * @returns
   */
  async dull(pattern) {
    let storageResults = new StorageResults("message");

    let match = (typeof pattern === "object") ? (pattern.match || pattern) : pattern;
    let key = this.urn(match);

    if (this._cortex.has(key)) {
      // delete from cache
      if (!this._cortex.delete(key)) {
        storageResults.setResults(500, "map delete error");
        return storageResults;
      }
    }

    if (this._junction) {
      // delete from source cortex
      storageResults = await this._junction.dull({ key: key });
      return storageResults;
    }

    storageResults.setResults(500, "Cortex junction not activated");
    return storageResults;
  }

  /**
   *
   * @param {*} pattern ETL tracts name
   * @returns
   */
  async recall(pattern) {
    let storageResults = new StorageResults("map");

    let match = (typeof pattern === "object") ? (pattern.match || pattern) : pattern;
    let key = this.urn(match);

    if (this._cortex.has(key)) {
      // entry has been cached
      let entry = this._cortex.get(key);
      storageResults.add(entry, key);
    }
    else if (this._junction) {
      // go to the source cortex
      storageResults = await this._junction.recall({ key: key });
      logger.verbose("storage/cortex: recall, " + storageResults.status);
    }
    else {
      storageResults.setResults(404, "Not Found");
    }

    if (storageResults.status === 0 && pattern.resolve) {
      // check for alias smt
      let entry = storageResults.data[ key ];
      if (entry.type === "alias") {
        // recall the entry for the source urn
        let results = await this._junction.recall({
          match: {
            key: entry.source
          },
          resolve: false  // only recurse once
        });

        // return source value, NOTE: not the alias value
        if (results.status === 0)
          storageResults.data[ key ] = results.data[ entry.source ];
      }
    }

    if (storageResults.status === 0 && !pattern.resolve) {
      // cache tracts definition
      let entry = storageResults.data[ key ];
      if (key === this.urn(entry)) // double check it wasn't an alias lookup
        this._cortex.set(key, entry);
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

      // retrieve list from source cortex
      storageResults = await this._junction.retrieve(pattern);
      logger.verbose("storage/cortex: retrieve, " + storageResults.status);
    }
    else {
      storageResults.setResults(503, "Cortex Unavailable");
    }

    return storageResults;
  }
};
