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

    this._entries.set(entry.name, entry);
    if (this._junction) {
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
      if (!this._entries.delete(name)) {
        results.resultCode = 500;
        results.resultText = "map delete error";
      }
    }

    if (this._junction) {
      results = await this._junction.dull({ key: name });
    }

    return results;
  }

  async recall(options) {
    let results = {
      resultCode: 0,
      resultText: "OK"
    };

    let name = options.name || options;
    if (this._entries.has(name)) {
      results.data = this._entries.get(name);
    }
    else if (this._junction) {
      results = await this._junction.recall({ key: name });
      logger.verbose(results.resultCode);
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
      results = await this._junction.retrieve(pattern);
      logger.verbose(results.resultCode);
    }
    else {
      results.resultCode = 503;
      results.resultText = "Codex Unavailable";
    }

    return results;
  }
};
