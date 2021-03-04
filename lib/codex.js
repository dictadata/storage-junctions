/**
 * storage/codex
 *
 * Codex is a data management storage source.
 * 
 */
"use strict";

const Engram = require('./engram');
const Field = require('./field');
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
  
    this._codex = new Map();

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
