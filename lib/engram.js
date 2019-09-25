"use strict";

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
