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

/* Example schema entry
"smt_name": {
  "smt": {},
  "description": {},
  "fields": {},
  "options": {},
  "tags": {}
}
*/

/* example tract entry
"tract_name": {
  "description": "",
  "origin": {},
  "transform": {},
  "terminal": {}
}
*/

module.exports = exports = class Codex {

  constructor(SMT) {
    this._engram = new Engram(SMT);

    this._schemas = new Map();
    this._tracts = new Map();

  }

  store(name, encoding) {
    this._schemas.set(name, encoding);
  }

  recall(name) {
    if (this._schemas.has(name))
      return this._schemas.get(name);
    else
      return null;
  }

  dull(name) {
    if (this._schemas.has(name))
      return this._schemas.delete(name);
  }
};
