/**
 * storage/codex
 *
 * MODULE NOT USED
 * An attempt at a manager class for using codex engrams and ETL tracts from same interface.
 *
 * Codex is a data directory of engram encoding definitions.
 * Codex acts as a data locator and data dictionary.
 *
 * codex entry types:
 *   engram - SMT encoding definitions
 *   alias  - points to an engram of tract entry
 *
 * Uses an underlying document based StorageJunction such as ElasticsearchJunction or MongoDB for persistent storage.
 * A simple internal cache is implemented with a Map object.
 */
"use strict";

const { logger } = require("../utils");

const CodexStore = require('./codex_store');
// const Engrams = require("./engrams");
// const Tracts = require("./tracts");

const codexTypes = [ "alias", "engram", "tract" ];

module.exports = exports = class Codex {

  /**
   * @param { Object } options that will be passed to the underlying junction.
   * @param { Object } options.engrams the smt and options for engrams datastore
   * @param { Object } options.tracts the smt and options for tracts datastore
   */
  constructor(options) {
    this.options = options || {};

    this._active = false;  // codex active

    this.engrams;
    this.tracts;
  }

  /**
   * Codex is active when the junctions are connected.
   */
  get isActive() {
    return this._active;
  }

  /**
   * Activate the Codex
   *
   * @returns true if underlying junction was activated successfully
   */
  async activate() {

    try {
      this.engrams = new CodexStore("engram", this.options.engrams);
      this.tracts = new CodexStore("tract", this.options.tracts);
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
    if (this.engrams) {
      await this.engrams.relax();
      this.engrams = null;
    }
    if (this.tracts) {
      await this.tracts.relax();
      this.tracts = null;
    }
  }

  /**
   *
   * @param {*} entry Engram or encoding object with codex properties
   * @returns
   */
  async store(entry, codex_type = "engram") {
    switch (codex_type) {
      case "tract":
        if (this._tracts)
          return this.tracts.store(entry);
        break;
      case "engram":
      default:
        if (this.engrams)
          return this.engrams.store(entry);
        break;
    }
  }

  /**
   *
   * @param {*} name SMT name or ETL tract name
   * @returns
   */
  async dull(pattern, codex_type = "engram") {
    switch (codex_type) {
      case "tract":
        if (this._tracts)
          return this.tracts.dull(pattern);
        break;
      case "engram":
      default:
        if (this.engrams)
          return this.engrams.dull(pattern);
        break;
    }
  }

  /**
   *
   * @param {*} name SMT name or ETL tract name
   * @returns
   */
  async recall(pattern, codex_type = "engram") {
    switch (codex_type) {
      case "tract":
        if (this._tracts)
          return this.tracts.recall(pattern);
        break;
      case "engram":
      default:
        if (this.engrams)
          return this.engrams.recall(pattern);
        break;
    }
  }

  /**
   *
   * @param {*} pattern pattern object that contains query logic
   * @returns
   */
  async retrieve(pattern, codex_type = "engram") {
    switch (codex_type) {
      case "tract":
        if (this._tracts)
          return this.tracts.retrieve(pattern);
        break;
      case "engram":
      default:
        if (this.engrams)
          return this.engrams.retrieve(pattern);
        break;
    }
  }

};
