/**
 * storage/tracts
 *
 * Codex is a data directory and dictionary of encoding definitions.
 *
 * codex types:
 *   engram - SMT encoding definitions
 *   tract  - ETL tract definitions
 *   alias  -
 *
 * An underlying StorageJunction such as ElasticsearchJunction can be used for persistent storage.
 * A simple cache is implemented with a Map.
 */
"use strict";

const Cortex = require("./cortex");
const { SMT, StorageResults, StorageError } = require("./types");
const { hasOwnProperty, logger } = require("./utils");
const fs = require("node:fs");
const homedir = process.env[ "HOMEPATH" ] || require('os').homedir();

const tracts_encoding = require("./tracts.encoding.json");

const codexTypes = [ "tract", "alias" ];

module.exports = exports = class Tracts {

  /**
   * @param { SMT }    smt an SMT string or SMT object where Tracts data will be located. This parameter can NOT be an SMT name!
   * @param { Object } options that will be passed to the underlying junction.
   */
  constructor(smt, options) {
    this.smt = new SMT(smt);
    this.options = options || {};

    this._tracts = new Map();
    this._active = false;
    this._junction = null;
  }

  get isActive() {
    return this._active;
  }

  urn(match) {
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
   * Activate the Tracts junctions
   *
   * @returns true if underlying junction was activated successfully
   */
  async activate() {

    try {
      let options = Object.assign({}, this.options);
      if (!options.encoding)
        options.encoding = tracts_encoding;

      if (this.smt.key === "*") {
        // use default smt.key
        let s = new SMT(tracts_encoding.smt);
        this.smt.key = s.key;
      }

      // check to read certificate authorities from file
      let tls = options.tls || options.ssl;
      if (tls && tls.ca) {
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
      this._junction = await Cortex.activate(this.smt, options);

      // attempt to create tracts schema
      let results = await this._junction.createSchema();
      if (results.status === 0) {
        logger.info("storage/tracts: created schema, " + this._junction.smt.schema);
      }
      else if (results.status === 409) {
        logger.debug("storage/tracts: schema exists");
      }
      else {
        throw new StorageError(500, "unable to create tracts schema");
      }
      this._active = true;
    }
    catch (err) {
      logger.error('storage/tracts: activate failed, ', err.message || err);
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
   * @param {*} entry object with tracts properties
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

    let tract = entry;
    let key = this.urn(tract);

    // save in cache
    this._tracts.set(key, tract);

    if (this._junction) {
      // save in source tracts
      storageResults = await this._junction.store(tract, { key: key });
      logger.verbose("storage/tracts: " + key + ", " + storageResults.status);
      return storageResults;
    }

    storageResults.setResults(500, "Tracts junction not activated");
    return storageResults;
  }

  /**
   *
   * @param {*} name SMT name or ETL tract name
   * @returns
   */
  async dull(pattern) {
    let storageResults = new StorageResults("message");

    let match = (typeof pattern === "object") ? (pattern.match || pattern) : pattern;
    let key = this.urn(match);

    if (this._tracts.has(key)) {
      // delete from cache
      if (!this._tracts.delete(key)) {
        storageResults.setResults(500, "map delete error");
        return storageResults;
      }
    }

    if (this._junction) {
      // delete from source tracts
      storageResults = await this._junction.dull({ key: key });
      return storageResults;
    }

    storageResults.setResults(500, "Tracts junction not activated");
    return storageResults;
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

    if (this._tracts.has(key)) {
      // entry has been cached
      let entry = this._tracts.get(key);
      storageResults.add(entry, key);
    }
    else if (this._junction) {
      // go to the source tracts
      storageResults = await this._junction.recall({ key: key });
      logger.verbose("storage/tracts: recall, " + storageResults.status);
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
        this._tracts.set(key, encoding);
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

      // retrieve list from source tracts
      storageResults = await this._junction.retrieve(pattern);
      logger.verbose("storage/tracts: retrieve, " + storageResults.status);
    }
    else {
      storageResults.setResults(503, "Tracts Unavailable");
    }

    return storageResults;
  }
};
