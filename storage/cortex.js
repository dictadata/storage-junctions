/**
 * storage/cortex
 *
 * A strategy for creating a storage node given a storage path.
 *
 */
"use strict";

const { StorageError } = require("./types");
const { typeOf, hasOwnProperty } = require("./utils");

class Cortex {

  static use(model, storageJunctionClass, usesFileSystems = false) {
    Cortex._storageJunctions.set(model, storageJunctionClass);
    if (usesFileSystems)
      Cortex.FileSystems.usedBy(model);
  }

  static async activate(SMT, options) {
    let model = "";
    if (typeof SMT === "string") {
      let a = SMT.split("|");
      model = a[0];
    }
    else if (typeOf(SMT) === "object") {
      model = SMT.model || (SMT.smt && SMT.smt.model);
    }
    else {
      throw new StorageError(400, "Invalid parameter: smt");
    }

    if (Cortex._storageJunctions.has(model)) {
      let junction = new (Cortex._storageJunctions.get(model))(SMT, options);
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
   * add junction models that use filesystems
   * @param {string} model 
   */
  static usedBy(model) {
    FileSystems._usedByModels.push(model);
  }

  /**
   * check if junction model uses filesystems
   * @param {string} model 
   */
  static isUsedBy(model) {
    return FileSystems._usedByModels.includes(model);
  }

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
    if (!FileSystems.isUsedBy(smt.model))
      throw new StorageError( 400, "junction's model does not support a filesystem, " + smt.model);

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
// junction models that use filesystems
FileSystems._usedByModels = [];

module.exports = exports = Cortex;
