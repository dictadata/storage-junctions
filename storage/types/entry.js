/**
 * storage/types/entry.js
 *
 * An Engram (encoding) is a storage memory trace (SMT) plus field definitions.
 * Field definitions are needed to encode and decode constructs for storage.
 *
 * SMT and Engram represent the same concept, accessing a specific datasource,
 * and can sometimes be interchangable as parameters.  For example if the field
 * definitions are not needed to access the datasource.
 *
 * Extra information about the datasource may be be stored in Engram properties such
 * as indices and source specific field properties needed to (re)create a schema.
 */
"use strict";

const StorageError = require('./storage-error');
const { typeOf, hasOwnProperty } = require("../utils");

module.exports = exports = class Entry {

  /**
   * Codex Entry class
   *
   * @param {Object} options an object containing common Codex entry properties.
   */
  constructor(options) {
    // codex properties from codex.options.json
    if (options.name) this.name = options.name;
    if (options.type) this.type = options.type;
    if (options.roles) this.roles = options.roles;
    if (options.domain) this.domain = options.domain;
    if (options.source) this.source = options.source;
    if (options.title) this.title = options.title;
    if (options.description) this.description = options.description;
    if (options.notes) this.notes = options.notes;
    if (options.tags) this.tags = options.tags;
  }

  get smt_urn() {
    if (this.domain)
      return this.domain + ":" + this.name;
    else
      return ":" + this.name;
  }

};
