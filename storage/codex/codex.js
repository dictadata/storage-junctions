/**
 * storage/codex
 *
 * Codex is a general purpose data directory and catalog.
 *
 */
"use strict";

const storage = require("../index");
const { StorageError } = require("../types");
const logger = require("../utils/logger");

const codexEncoding = require("./codex.encoding.json");

module.exports = exports = class Codex {

  constructor(options = {}) {
    this.options = options || {};

    this._entries = new Map();
    this._active = false;
    this._junction = null;
  }

  get isActive() {
    return this._active;
  }

  async activate(options = {}) {
    options = Object.assign({}, this.options, options);

    try {
      if (options.smt) {
        let encoding = options.encoding || codexEncoding;
        this._junction = await storage.activate(options.smt, { encoding: encoding });

        // attempt to create accounts schema
        let results = await this._junction.createSchema();
        if (results.resultCode === 0) {
          logger.info("created codex schema");
        }
        else if (results.resultCode === 409) {
          logger.verbose("codex schema exists");
        }
        else {
          throw new StorageError(500, "unable to create codex schema");
        }
        this._active = true;
      }
    }
    catch (err) {
      logger.error('codex activate failed: ', err);
    }

    return this._active;
  }

  async relax() {
    this._active = false;
    if (this._junction)
      await this._junction.relax();
  }

  async store(entry) {
    let results = {
      resultCode: 0,
      resultText: "OK"
    };

    // save in cache
    this._entries.set(entry.name, entry);

    if (this._junction) {
      // save in source codex
      results = await this._junction.store(entry);
      logger.verbose(results.resultCode);
    }

    return results;
  }

  async dull(options) {
    let results = {
      resultCode: 0,
      resultText: "OK"
    };

    let name = options.name || options;

    if (this._entries.has(name)) {
      // delete from cache
      if (!this._entries.delete(name)) {
        results.resultCode = 500;
        results.resultText = "map delete error";
      }
    }

    if (this._junction) {
      // delete from source codex
      results = await this._junction.dull({ key: name });
    }

    return results;
  }

  async recall(options) {
    let results = {
      resultCode: 0,
      resultText: "OK",
      data: {}
    };

    let name = options.name || options;
    if (this._entries.has(name)) {
      // entry has been cached
      let entry = this._entries.get(name);
      results.data[ name ] = entry;
    }
    else if (this._junction) {
      // go to the source codex
      results = await this._junction.recall({ key: name });
      logger.verbose(results.resultCode);

      // cache entry
      if (results.resultCode === 0) {
        let entry = results.data[ name ];
        this._entries.set(name, entry);
      }
    }
    else {
      results.resultCode = 404;
      results.resultText = "Not Found";
    }

    return results;
  }

  async retrieve(pattern) {
    let results = {
      resultCode: 0,
      resultText: "OK"
    };

    if (this._junction) {
      // retrieve list from source codex
      results = await this._junction.retrieve(pattern);
      logger.verbose(results.resultCode);

      // current design does not caching entries from retrieved list
    }
    else {
      results.resultCode = 503;
      results.resultText = "Codex Unavailable";
    }

    return results;
  }
};
