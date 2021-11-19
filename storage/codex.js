/**
 * storage/codex
 *
 * Codex is a general purpose data directory and data manager.
 *
 */
"use strict";

//const Engram = require('./types/engram');
//const Field = require('./types/field');
//const Types = require("./types");

/* example smt entry
{
  "codex_name": "",
  "codex_type": "smt",
  "description": "",
  "tags": [],

  "smt": "" | {},
  "fields": "" | {},
}
*/

/* example tract entry
{
  "codex_name": "",
  "codex_type": "tract",
  "description": "",
  "tags": [],

  "origin": {},
  "transform": {},
  "terminal": {}
}
*/

module.exports = exports = class Codex {

  constructor(options) {
    //this._engram = new Engram(options.smt);

    this._engrams = new Map();
    this._tracts = new Map();
  }

  store(codex_name, entry) {
    this._engrams.set(codex_name, entry);
  }

  recall(codex_name) {
    if (this._engrams.has(codex_name))
      return this._engrams.get(codex_name);
    else
      return null;
  }

  dull(codex_name) {
    if (this._engrams.has(codex_name))
      return this._engrams.delete(codex_name);
  }

};
