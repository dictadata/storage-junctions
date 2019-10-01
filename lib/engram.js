/**
 * storage/engram
 *
 * An Engram is a desciptor for a storage memory location (locus)
 * and the information needed to encode and decode constructs for storage.
 *
 * Storage Memory Trace (SMT) is a string representing a storage memory location.
 * SMT and Engram represent the same concept and are interchangable.
 *
 * smt: 'model|location|schema|key'
 */
"use strict";

var Field = require('./field');
const {StorageError} = require("./types");

module.exports = class Engram {

  /**
   * Engram class
   * @param {*} storagePath is an SMT (Storage Memory Trace) or another Engram
   */
  constructor(storagePath) {
    this._smt = storagePath;  // original path for debugging

    if (typeof storagePath === "string") {
      // assume smt string
      let smt = storagePath.split("|");
      this.model = smt[0] || "*";
      this.location = smt[1] || '*';
      this.schema = smt[2] || '*';
      this.key = smt[3] || '*';
    }
    else if (storagePath instanceof Engram) {
      this.model = storagePath.model;
      this.location = storagePath.location;
      this.schema = storagePath.schema;
      this.key = storagePath.key;
    }
    else {
      throw new StorageError({statusCode: 400}, "Invalid Parameter: storagePath");
    }

    // field encodings
    this.fields = {};
  }

  /**
   * at least one field encoding defined
   * denotes that encodings have been loaded from or saved to storage source
   */
  get active () {
    return Object.keys(this.fields).length > 0;
  }

  /**
   * Returns storage memory trace (smt) of the engram.
   */
  get smt () {
    return this.model + "|" + this.location + "|" + this.schema + "|" + this.key;
  }

  toString() {
    return this.smt;
  }

  // ----- keys -----

  get keyof () {
    if (!this.key)
      return 'none';
    switch (this.key[0]) {
      case '*':
        return 'all';   // keys specified in field encodings, or no recall
      case '=':
        return 'list';  // field list for lookup
      case '!':
        return 'key';   // app provided key; optional, field list to calculate key
      default:
        return 'uid';   // an individual uid, to use as default
    }
  }

  /**
   * Get field names from engram key or field encodings
   */
  get keys() {
    let keys = [];

    if (this.keyof === 'list' || this.keyof === 'key') {
      // get keys from smt key |.|.|.|=name1+name2+...
      keys = this.key.substring(1).split('+');
    }
    else if (this.keyof === 'all') {
      // look for key fields in the encoding
      for (let name in this.fields) {
        let field = this.fields[name];
        if (field.isKey)
          keys.push(name);
      }
    }

    return keys;
  }

  // ----- unique identifiers -----

  get uid () {
    if (this.keyof === 'uid') {
      return this.key;
    }

    return null;
  }

  get_uid(construct) {
    if (this.keyof === 'uid') {
      return this.key;
    }
    else if (this.keyof === 'key') {
      if (!construct)
        return null;

      // generate an uid from construct[name] + ...
      let uid = '';
      for (let name of this.keys) {
        if (construct[name])
          uid += construct[name];  //.toString();
      }
      return uid;
    }
    return null;
  }

  // ----- field encodings -----

  dull() {
    this.fields = {};
  }

  /**
   *
   * @param {*} field
   * @param {*} check
   */
  add(field) {
    if (!(field instanceof Field))
      field = new Field(field);
    if (!(field && field.name))
      throw new StorageError({statusCode: 400}, "Invalid field definition");

    this.fields[field.name] = field;

    return field;
  }

  /**
   *
   * @param {*} fields encoding object or fields array
   */
  merge(encoding_fields) {
    let srcFields = encoding_fields.fields || encoding_fields;  // code do some more type checking

    Object.assign(this.fields, srcFields);
  }

};
