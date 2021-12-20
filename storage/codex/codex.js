/**
 * storage/codex
 *
 * Codex is a general purpose data directory and data manager.
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
  }

  async activate(options = {}) {
    options = Object.assign({}, this.options, options);

    try {
      if (options.smt) {
        let encoding = options.encoding || codexEncoding;
        this.codexNode = await storage.activate(options.smt, { encoding: encoding });

        // attempt to create accounts schema
        let results = await this.codexNode.createSchema();
        if (results.resultCode === 0) {
          logger.info("created codex schema");
        }
        else if (results.resultCode === 409) {
          logger.verbose("codex schema exists");
        }
        else {
          throw new StorageError(500, "unable to create codex schema");
        }
      }
    }
    catch (err) {
      logger.error('codex activate failed: ', err);
    }
  }

  async relax() {
    if (this.codexNode)
      await this.codexNode.relax();
  }

  async store(entry) {
    this._entries.set(entry.name, entry);
    if (this.codexNode) {
      let results = await this.codexNode.store(entry);
      logger.verbose(results.resultCode);
    }
  }

  async recall(options) {
    let name = options.name || options;
    if (this._entries.has(name)) {
      return this._entries.get(name);
    }
    else if (this.codexNode) {
      let results = await this.codexNode.recall(name);
      logger.verbose(results.resultCode);
      return results.data[ name ];
    }
    else
      return null;
  }

  async dull(options) {
    let name = options.name || options;
    let deleted = false;
    if (this.codexNode) {
      //
    }
    if (this._entries.has(name))
      deleted = this._entries.delete(name);

    return deleted;
  }

  async retrieve(pattern) {
    if (this.codexNode) {
      let results = await this.codexNode.retrieve(pattern);
      logger.verbose(results.resultCode);
      return results.data;
    }
    else
      return null;
  }
};
