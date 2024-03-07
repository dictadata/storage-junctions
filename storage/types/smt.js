/** storage/types/smt
 *
 * Storage Memory Trace (SMT) is a string or object with access details for a specific data source.
 *   smt: 'model|locus|schema|key'
 */
"use strict";

const StorageError = require('./storage-error');
const { typeOf } = require("../utils");

module.exports = exports = class SMT {
  /**
   * parse an smt string into an object.
   * Returns an smt object.
   */
  constructor(smt) {

    if (!smt) {
      this.model = '';
      this.locus = '';
      this.schema = '';
      this.key = '';
    }
    else if (typeof smt === "string") {
      let a = smt.split("|");
      if (a.length != 4)
        throw new StorageError(400, "Invalid parameter: smt");

      this.model = a[ 0 ] || '';
      this.locus = a[ 1 ] || '';
      this.schema = a[ 2 ] || '';
      this.key = a[ 3 ] || '';
    }
    else if (typeOf(smt) === "object") {
      if (!Object.hasOwn(smt, "model") && !Object.hasOwn(smt, "locus")
        && !Object.hasOwn(smt, "schema") && !Object.hasOwn(smt, "key"))
        throw new StorageError(400, "Invalid parameter: smt");

      this.model = smt.model || '';
      this.locus = smt.locus || '';
      this.schema = smt.schema || '';
      this.key = smt.key || '';
    }
    else
      throw new StorageError(400, "Invalid parameter: smt");
  }

  /**
   * Returns the SMT string representation.
   */
  toString() {
    return this.model + "|" + this.locus + "|" + this.schema + "|" + this.key;
  }

};
