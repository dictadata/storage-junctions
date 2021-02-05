/**
 * storage/cortex
 *
 * A strategy for creating a storage node given a storage path.
 *
 */
"use strict";

const { typeOf, StorageError } = require("./types");

class Cortex {

  static use(model, storageJunctionClass, usesFileSystems = false) {
    Cortex._storageJunctions[model] = storageJunctionClass;
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
      throw new StorageError({ statusCode: 400, model: model }, "Invalid parameter: smt");
    }

    if (Object.prototype.hasOwnProperty.call(Cortex._storageJunctions, model)) {
      let junction = new Cortex._storageJunctions[model](SMT, options);
      await junction.activate();
      return junction;
    }
    else
      throw new StorageError({ statusCode: 400, model: model }, "Unknown smt.model: " + model);
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
    Transforms._transforms[tfType] = transformClass;
  }

  static create(tfType, options) {
    if (!tfType)
      throw new StorageError({ statusCode: 400 }, "invalid transform type");

    if (Object.prototype.hasOwnProperty.call(Transforms._transforms, tfType)) {
      let transform = new Transforms._transforms[tfType](options);
      return transform;
    }
    else
      throw new StorageError({ statusCode: 400, tfType: tfType }, "Unknown transform type: " + tfType);
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
    FileSystems._fileSystems[fsPrefix] = FileSystemsClass;
  }

  static async activate(smt, options) {
    if (!smt)
      throw new StorageError({ statusCode: 400 }, "invalid smt");
    if (!FileSystems.isUsedBy(smt.model))
      throw new StorageError({ statusCode: 400 }, "junction's model does not support a filesystem, " + smt.model);

    let fsPrefix = 'file';
    if (smt.locus.indexOf(':') > 1)
      fsPrefix = smt.locus.split(':')[0].toLowerCase();

    if (Object.prototype.hasOwnProperty.call(FileSystems._fileSystems, fsPrefix)) {
      let stfs = new FileSystems._fileSystems[fsPrefix](smt, options);
      await stfs.activate();
      return stfs;
    }
    else
      throw new StorageError({ statusCode: 400, fsPrefix: fsPrefix }, "Unknown FileSystem type: " + fsPrefix);
  }

  static async relax(stfs) {
    if (stfs && stfs.relax) await stfs.relax();
  }

}

// Cortex static members
Cortex._storageJunctions = {};
Cortex.Transforms = Transforms;
Cortex.FileSystems = FileSystems;

// Transforms static members
Transforms._transforms = {};

// FileSystems static members
FileSystems._fileSystems = {};
// junction models that use filesystems
FileSystems._usedByModels = [];

module.exports = exports = Cortex;
