/**
 * storage/types/tract.js
 *
 * tract definition
 */

"use strict";

const Entry = require('./entry');
const StorageError = require('./storage-error');
const { typeOf, hasOwnProperty } = require("../utils");


module.exports = exports = class Tract extends Entry {

  constructor(options) {
    super(options);
    this.type = "tract";
    this.tract = options.tract || {};
  }

};
