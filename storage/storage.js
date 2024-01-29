/**
 * storage/storage-storage
 *
 * Static classes implementations.
 *
 *   StorageJunctions
 *   FileSystems
 *   Transforms
 *   Codex
 */
"use strict";

const Junctions = require("./junctions");
const FileSystems = require("./filesystems");
const Transforms = require("./transforms");
const Codex = require("./codex");

const { SMT, StorageError } = require("./types");

class Storage {

  /**
   * Create and activate a StorageJunction given an SMT.
   * Will do Codex engram and auth lookups.
   *
   * @param {*} smt an SMT name, SMT string or SMT object
   * @param {*} options options to pass to the storage-junction
   * @returns
   */
  static async activate(smt, options) {
    let _smt = {};
    if (!options) options = {};

    // lookup/verify SMT object
    if (typeof smt === "string" && smt.indexOf('|') < 0 && Codex.engrams) {
      // lookup urn in Codex
      let results = await Codex.engrams.recall({
        match: {
          key: smt
        },
        resolve: true
      });
      if (results.status !== 0)
        throw new StorageError(results.status, results.message + ": " + smt);

      let entry = results.data[ smt ];
      _smt = entry.smt;
      if (entry.options)
        options = Object.assign({}, entry.options, options);
      if (!options.encoding && entry.fields)
        options.encoding = entry.fields;
    }
    else {
      // SMT string or object
      _smt = new SMT(smt);
    }

    // check for auth options
    if (!options.auth && Codex.auth.has(_smt.locus)) {
      let stash = Codex.auth.recall(_smt.locus);
      options = Object.assign(options, stash);
    }

    // create the junction
    let junction = Junctions.activate(_smt, options);
    return junction;
  }

}

Storage.Junctions = Junctions;
Storage.Transforms = Transforms;
Storage.FileSystems = FileSystems;
Storage.Codex = Codex;

module.exports = exports = Storage;
