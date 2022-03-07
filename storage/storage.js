/**
 * storage/storage
 *
 * Strategies, as static classes, for registering storage classes and creating storage objects.
 * Includes strategies for:
 *   Storage (StorageJunctions)
 *   Storage.FileSystems
 *   Storage.Transforms
 */
"use strict";

const { parseSMT, StorageError } = require("./types");
//const { typeOf, hasOwnProperty } = require("./utils");

class Storage {

  /**
   * Cortex
   */
  static set cortex(cortex) {
    Storage._cortex = cortex;
  }

  static get cortex() {
    return Storage._cortex;
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
    Storage._storageJunctions.set(model, storageJunctionClass);
  }

  /**
   * Activate a StorageJunction given an SMT.
   *
   * @param {*} SMT an SMT name, SMT string or SMT object
   * @param {*} options
   * @returns
   */
  static async activate(SMT, options) {
    if (!options) options = {};
    let smt = {};
    let entry;

    if (typeof SMT === "string" && SMT.indexOf('|') < 0 && Storage._cortex) {
      let results = await Storage._cortex.recall(SMT);
      entry = results.data[ SMT ];
      smt = entry.smt;
      if (!options.encoding) options.encoding = entry;
    }
    else
      smt = parseSMT(SMT);

    if (Storage._storageJunctions.has(smt.model)) {
      let junctionClass = Storage._storageJunctions.get(smt.model);
      let junction = new junctionClass(smt, options);
      await junction.activate();
      return junction;
    }
    else
      throw new StorageError(400, "Unknown smt.model: " + smt.model);
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

// Storage static properties
Storage._cortex = null;

Storage._storageJunctions = new Map();

// Transforms static properties
Transforms._transforms = new Map();
Storage.Transforms = Transforms;

// FileSystems static properties
FileSystems._fileSystems = new Map();
Storage.FileSystems = FileSystems;

module.exports = exports = Storage;
