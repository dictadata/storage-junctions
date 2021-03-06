/**
 * storage/cortex
 *
 * A strategy for creating a storage node given a storage path.
 *
 */
"use strict";

const { parseSMT, StorageError } = require("./types");
const { typeOf, hasOwnProperty } = require("./utils");

class Cortex {

  static use(model, storageJunctionClass) {
    Cortex._storageJunctions.set(model, storageJunctionClass);
  }

  static async activate(SMT, options) {
    let smt = parseSMT(SMT);

    if (Cortex._storageJunctions.has(smt.model)) {
      let junctionClass = Cortex._storageJunctions.get(smt.model);
      let junction = new junctionClass(SMT, options);
      await junction.activate();
      return junction;
    }
    else
      throw new StorageError(400, "Unknown smt.model: " + model);
  }

  static async relax(junction) {
    // developers should call this instead of junction.relax()
    // could implement some pool or tracking or something here

    if (junction && junction.relax) await junction.relax();
  }

}

class Transforms {

  static use(tfType, transformClass) {
    // need to do some validation
    Transforms._transforms.set(tfType, transformClass);
  }

  static create(tfType, options) {
    if (!tfType)
      throw new StorageError( 400, "invalid transform type");

    if (Transforms._transforms.has(tfType)) {
      let transform = new (Transforms._transforms.get(tfType))(options);
      return transform;
    }
    else
      throw new StorageError(400, "Unknown transform type: " + tfType);
  }

}

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
      throw new StorageError( 400, "invalid smt");

    let fsPrefix = 'file';
    if (smt.locus.indexOf(':') > 1)
      fsPrefix = smt.locus.split(':')[0].toLowerCase();

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

// Cortex static members
Cortex._storageJunctions = new Map();
Cortex.Transforms = Transforms;
Cortex.FileSystems = FileSystems;

// Transforms static members
Transforms._transforms = new Map();

// FileSystems static members
FileSystems._fileSystems = new Map();

module.exports = exports = Cortex;
