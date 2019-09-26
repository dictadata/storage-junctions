/**
 * storage/engram
 *
 */
"use strict";

const Encoding = require('./encoding');

/**
 *  Storage Memory Trace (SMT) is a string representing a storage memory location.
 *  SMT and Engram represent the same concept and are interchangable.
 *
 *  smt: 'model|location|schema|key'
 */

/**
 * An engram is a desciptor for a storage memory location (locus).
 */
module.exports = class Engram {

  /**
   * Engram class
   * @param {*} storagePath is an SMT (Storage Memory Trace) or another Engram
   */
  constructor(storagePath) {
    this._storagePath = storagePath;  // original path for debugging

    if (typeof storagePath === "string") {
      // assume smt string
      let smt = storagePath.split("|");
      this.model = smt[0] || "storage";
      this.location = smt[1] || '';
      this.schema = smt[2] || '';
      this.key = smt[3] || '';
    }
    else if (storagePath instanceof Engram) {
      this.model = storagePath.model;
      this.location = storagePath.location;
      this.schema = storagePath.schema;
      this.key = storagePath.key;
    }
    else {
      throw new Error("Invalid Parameter: storagePath");
    }

    this.encoding = new Encoding();
  }

  get keyof () {
    if (!this.key)
      return 'none';
    if (this.key[0] === '*')
      return 'all';
    if (this.key[0] === '=')
      return 'fields';

    return 'uid';
  }

  /**
   * Get field names from engram key.
   * format:
   *    =name1+name2+...
   */
  get keys() {
    let keys = [];

    if (this.keyof === 'fields') {
      // get keys from smt key
      keys = this.key.substring(1).split('+');
    }
    else if (this.keyof === 'all') {
      // look for key fields in the encoding
      for (let name in this.encoding.fields) {
        let field = this.encoding.fields[name];
        if (field.isKey)
          keys.push(name);
      }
    }

    return keys;
  }

  get uid() {
    if (this.keyof === 'uid') {
      return this.key;
    }

    return null;
  }

  get_uid(construct) {
    if (this.keyof === 'uid') {
      return this.key;
    }
    else if (this.keyof === 'fields') {
      // generate an uid from construct[name] + ...
      let uid = '';
      for (let name of this.keys)
        uid += construct[name].toString();
      return uid;
    }
    else {
      return null;
    }
  }

  /**
   * Returns a storage memory trace for the engram.
   */
  get smt () {
    return this.model + "|" + this.location + "|" + this.schema + "|" + this.key;
  }

  toString() {
    return this.smt;
  }

};
