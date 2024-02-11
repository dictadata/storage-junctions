/**
 * storage/storage-storage
 *
 * Static classes implementations.
 *
 *   StorageJunctions
 *   FileSystems
 *   Transforms
 */
"use strict";

const auth = require("./auth");
const Junctions = require("./junctions");
const FileSystems = require("./filesystems");
const Transforms = require("./transforms");

const { SMT, StorageError } = require("./types");

class Storage {


  /**
   * Create and activate a StorageJunction given an SMT.
   * Will do Engrams engram and auth lookups.
   *
   * @param {*} smt an SMT name, SMT string or SMT object
   * @param {*} options options to pass to the storage-junction
   * @returns
   */
  static async activate(smt, options) {
    let _smt = {};
    if (!options)
      options = {};

    // SMT string or object
    _smt = new SMT(smt);

    // check for auth options
    if (!options.auth && auth.has(_smt.locus)) {
      let credentials = auth.recall(_smt.locus);
      options = Object.assign(options, credentials);
    }

    // create the junction
    let junction = Junctions.activate(_smt, options);
    return junction;
  }

}

Storage.auth = auth;
Storage.Junctions = Junctions;
Storage.Transforms = Transforms;
Storage.FileSystems = FileSystems;

module.exports = exports = Storage;
