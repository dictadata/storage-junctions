/**
 * storage/junctions
 */
"use strict";

const { SMT, StorageError } = require("../types");

class Junctions {
  /**
   * Register a StorageJunction
   *
   * @param {*} model
   * @param {*} storageJunctionClass
   */
  static use(model, storageJunctionClass) {
    Junctions._junctions.set(model, storageJunctionClass);
  }

  /**
   * Activate a StorageJunction given an SMT.
   *
   * @param {*} smt an SMT name, SMT string or SMT object
   * @param {*} options options to pass to the storage-junction
   * @returns
   */
  static async activate(smt, options) {
    let _smt = {};
    if (!options) options = {};

    // SMT string or object
    _smt = new SMT(smt);

    // create the junction
    if (Junctions._junctions.has(_smt.model)) {
      let junctionClass = Junctions._junctions.get(_smt.model);
      let junction = new junctionClass(_smt, options);
      await junction.activate();
      return junction;
    }
    else
      throw new StorageError(400, "Unknown SMT model: " + smt.toString());
  }

  /**
   * Release a StorageJunction instance
   *
   * @param {*} junction
   */
  static async relax(junction) {
    // developers should call this instead of junction.relax()
    // could implement some pool or tracking or something here

    if (junction?.relax)
      await junction.relax();
  }

}

// Junction static properties
Junctions._junctions = new Map();

module.exports = exports = Junctions;
