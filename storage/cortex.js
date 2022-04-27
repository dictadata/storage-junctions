/**
 * storage/cortex
 *
 * Strategies, as static classes, for registering storage classes and creating storage objects.
 * Includes strategies for:
 *   Cortex.StorageJunctions
 *   Cortex.FileSystems
 *   Cortex.Transforms
 */
"use strict";

const { SMT, StorageError } = require("./types");
//const { typeOf, hasOwnProperty } = require("./utils");

class Cortex {

  /**
   * Codex
   */
  static set codex(codex) {
    Cortex._codex = codex;
  }

  static get codex() {
    return Cortex._codex;
  }

  /**
   *
   * StorageJunctions
   */

  /**
   * Register a StorageJunction
   *
   * @param {*} model
   * @param {*} storageJunctionClass
   */
  static use(model, storageJunctionClass) {
    Cortex._storageJunctions.set(model, storageJunctionClass);
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

    if (typeof smt === "string" && smt.indexOf('|') < 0 && Cortex._codex) {
      // lookup SMT name in codex
      let results = await Cortex._codex.recall(smt);
      if (results.resultCode !== 0)
        throw new StorageError(400, "Unknown SMT name: " + smt);

      let entry = results.data[ smt ];
      _smt = entry.smt;
      if (entry.options)
        options = Object.assign(entry.options, options);
      if (!options.encoding && entry.fields)
        options.encoding = entry.fields;
    }
    else {
      // SMT string or object
      _smt = new SMT(smt);
    }

    if (Cortex._storageJunctions.has(_smt.model)) {
      let junctionClass = Cortex._storageJunctions.get(_smt.model);
      let junction = new junctionClass(_smt, options);
      await junction.activate();
      return junction;
    }
    else
      throw new StorageError(400, "Unknown SMT model: " + _smt.model);
  }

  /**
   * Release a StorageJunction instance
   *
   * @param {*} junction
   */
  static async relax(junction) {
    // developers should call this instead of junction.relax()
    // could implement some pool or tracking or something here

    if (junction && junction.relax) await junction.relax();
  }

}

/**
 * Transforms
 */
class Transforms {

  static use(tfType, transformClass) {
    // need to do some validation
    Transforms._transforms.set(tfType, transformClass);
  }

  static create(tfType, options) {
    if (!tfType)
      throw new StorageError(400, "invalid transform type");

    if (Transforms._transforms.has(tfType)) {
      let transform = new (Transforms._transforms.get(tfType))(options);
      return transform;
    }
    else
      throw new StorageError(400, "Unknown transform type: " + tfType);
  }

}

/**
 * FileSystems
 */
class FileSystems {

  /**
   * register filesystem prefix with a filesystem class
   * @param {string} fsPrefix filesystem prefix like file, http, ftp, s3, ...
   * @param {StorageFileSystem} FileSystemsClass
   */
  static use(fsPrefix, FileSystemsClass) {
    // need to do some validation
    FileSystems._fileSystems.set(fsPrefix, FileSystemsClass);
  }

  static async activate(smt, options) {
    if (!smt)
      throw new StorageError(400, "invalid smt");

    let fsPrefix = 'file';
    if (smt.locus.indexOf(':') > 1)
      fsPrefix = smt.locus.split(':')[ 0 ].toLowerCase();

    if (FileSystems._fileSystems.has(fsPrefix)) {
      let stfs = new (FileSystems._fileSystems.get(fsPrefix))(smt, options);
      await stfs.activate();
      return stfs;
    }
    else
      throw new StorageError(400, "Unknown FileSystem type: " + fsPrefix);
  }

  static async relax(stfs) {
    if (stfs && stfs.relax) await stfs.relax();
  }

}

// Cortex static properties
Cortex._codex = null;

Cortex._storageJunctions = new Map();

// Transforms static properties
Transforms._transforms = new Map();
Cortex.Transforms = Transforms;

// FileSystems static properties
FileSystems._fileSystems = new Map();
Cortex.FileSystems = FileSystems;

module.exports = exports = Cortex;
