/**
 * storage/types/tract.js
 *
 * tract definition
 */

"use strict";

const SMT = require('./smt');
const Entry = require('./entry');
const StorageError = require('./storage-error');
const { typeOf, hasOwnProperty } = require("../utils");


module.exports = exports = class Tract extends Entry {

  constructor() {
    super();
    this.type = "tract";

    this.source = {};
    this.transforms = {};
    this.terminal = {};
  }

};
