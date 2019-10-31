/**
 * storage/engram
 *
 * An Engram is a desciptor for a storage memory locus (locus)
 * and the information needed to encode and decode constructs for storage.
 *
 * Storage Memory Trace (SMT) is a string representing a storage memory locus.
 * SMT and Engram represent the same concept and are interchangable.
 *
 * smt: 'model|locus|schema|key'
 */
"use strict";

var Field = require('./field');
const {StorageError} = require("./types");

module.exports = class Engram {

  /**
   * Engram class
   * @param {*} SMT is a SMT string or SMT object
   */
  constructor(SMT) {

    if (typeof SMT === "string") {
      // assume smt string
      let smt = SMT.split("|");
      this.smt = {
        model: smt[0] || "*",
        locus: smt[1] || '*',
        schema: smt[2] || '*',
        key: smt[3] || '*'
      };

      // field encodings
      this.fields = {};
    }
    else if (typeof SMT === "object") {
      this.smt = SMT.smt || SMT;

      // field encodings
      if (SMT.fields)
        this.replace(SMT.fields);
      else
        this.fields = {};
    }
    else {
      throw new StorageError({statusCode: 400}, "Invalid Parameter: SMT");
    }

    if (process.env.NODE_ENV !== 'production')
      this._SMT = SMT;
  }

  /**
   * at least one field encoding defined
   * denotes that encodings have been loaded from or saved to storage source
   */
  get active () {
    return Object.keys(this.fields).length > 0;
  }

  toString() {
    return this.smt.model + "|" + this.smt.locus + "|" + this.smt.schema + "|" + this.smt.key;
  }

  // ----- keys -----

  get keyof () {
    if (!this.smt.key)
      return 'none';
    switch (this.smt.key[0]) {
      case '*':
        return 'all';   // primary keys specified in field encodings, or no recall
      case '=':
        return 'list';  // field list for lookup
      case '!':
        return 'key';   // app provided key; optional field list to calculate key
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
      keys = this.smt.key.substring(1).split('+');
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
      return this.smt.key;
    }

    return null;
  }

  get_uid(construct) {
    if (this.keyof === 'uid') {
      return this.smt.key;
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

  find(name) {
    let field = this.fields[name];
    if (!field) {
      field = new Field({name: name});
    }
    return field;
  }

  /**
   *
   * @param {*} field
   * @param {*} check
   */
  add(field) {
    let newField = new Field(field);
    if (!(newField && newField.name))
      throw new StorageError({statusCode: 400}, "Invalid field definition");

    this.fields[field.name] = newField;

    return newField;
  }

  /**
   * Removes all field encodings
   */
  dull() {
    this.fields = {};
  }

  /**
   *
   * @param {*} encoding is an engram or fields object
   */
  replace(encoding) {
    let fields = encoding.fields || encoding;  // code do some more type checking
    if (typeof fields !== 'object')
      throw new Error('invalid parameter');

    this.dull();
    Object.assign(this.fields, fields);
  }

  /**
   *
   * @param {*} encoding is an engram or fields object
   */
  merge(encoding) {
    let fields = encoding.fields || encoding;  // code do some more type checking
    if (typeof fields !== 'object')
      throw new Error('invalid parameter');

    Object.assign(this.fields, fields);
  }

};
