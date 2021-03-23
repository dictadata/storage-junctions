/**
 * storage/codex
 *
 * Codex is a data management storage source.
 * 
 */
"use strict";

const Engram = require('./types/engram');
const Field = require('./types/field');
const Types = require("./types");

/* Example codex entry
"smt_name": {
  "smt": {},
  "fields": {},
  "options": 
  "tags": {}
}
*/


module.exports = exports = class Codex {

  constructor(SMT) {
    this._engram = new Engram(SMT);
  
    this._schemas = new Map();
    this._tracts = new Map();

  }

  add(name, encoding) {
    this._codex.set(name, encoding);
  }

  find(name) {
    if (this._codex.has(name))
      return this._codex.get(name);
    else
      return null;
  }

  load()
}
