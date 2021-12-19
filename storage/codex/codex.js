/**
 * storage/codex
 *
 * Codex is a general purpose data directory and data manager.
 *
 */
"use strict";

const Cortex = require("../cortex");
//const Engram = require('./types/engram');
//const Field = require('./types/field');
//const Types = require("./types");


module.exports = exports = class Codex {

  constructor(options = {}) {
    if (options.smt) {
      this.jncSource = Cortex.activate(options.smt);
    }

    this._entries = new Map();
  }

  relax() {
    if (this.jncSource)
      this.jncSource.relax();
  }

  store(entry) {
    this._entries.set(entry.name, entry);
  }

  recall(name) {
    if (this._entries.has(name))
      return this._entries.get(name);
    else
      return null;
  }

  dull(name) {
    if (this._entries.has(name))
      return this._entries.delete(name);
  }

};
