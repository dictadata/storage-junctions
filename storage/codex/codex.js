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
    this._entries.set(entry.name, entry);
    if (this._junction) {
      let results = await this._junction.store(entry);
      logger.verbose(results.resultCode);
    }
  }

  async recall(options) {
    let name = options.name || options;
    if (this._entries.has(name)) {
      return this._entries.get(name);
    }
    else if (this._junction) {
      let results = await this._junction.recall({ key: name });
      logger.verbose(results.resultCode);
      return results.data[ name ];
    }
    else
      return null;
  }

  async dull(options) {
    let name = options.name || options;
    let deleted = 404; // not found

    if (this._entries.has(name)) {
      deleted = this._entries.delete(name) ? 0 : 500;
    }

    if (this._junction) {
      let results = await this._junction.dull({ key: name });
      deleted = results.resultCode;
    }

    return deleted;
  }

  async retrieve(pattern) {
    if (this._junction) {
      let results = await this._junction.retrieve(pattern);
      logger.verbose(results.resultCode);
      return results.data;
    }
    else
      return null;
  }
};
