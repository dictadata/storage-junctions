/**
 * storage/cortex
 *
 * A strategy for creating a storage node given a storage path.
 *
 */
"use strict";

const { StorageError } = require("./types");

class Cortex {

  static use(model, storageJunctionClass) {
    Cortex._storageJunctions[model] = storageJunctionClass;
  }

  static async activate(SMT, options) {
    let model = "";
    if (typeof SMT === "string") {
      let a = SMT.split("|");
      model = a[0];
    }
    else if (typeof SMT === "object") {
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
      throw new StorageError({ statusCode: 400, fsType: tfType }, "Unknown transform type: " + tfType);
  }

}

class FileStorage {

  static add(model) {
    FileStorage._fsModels.push(model);
  }

  static use(fsType, fileStorageClass) {
    // need to do some validation
    FileStorage._fileStores[fsType] = fileStorageClass;
  }

  static async activate(SMT, options) {
    if (!SMT)
      throw new StorageError({ statusCode: 400 }, "invalid smt");
    if (!FileStorage._fsModels.includes(SMT.model))
      throw new StorageError({ statusCode: 400 }, "invalid model");

    let fsType = 'fs';
    if (SMT.locus.includes(':'))
      fsType = SMT.locus.split(':')[0].toLowerCase();

    if (Object.prototype.hasOwnProperty.call(FileStorage._fileStores, fsType)) {
      let fst = new FileStorage._fileStores[fsType](SMT, options);
      await fst.activate();
      return fst;
    }
    else
      throw new StorageError({ statusCode: 400, fsType: fsType }, "Unknown FileStorage type: " + fsType);
  }

  static async relax(fst) {
    if (fst && fst.relax) await fst.relax();
  }

}

// Cortex static members
Cortex._storageJunctions = {};
Cortex.Transforms = Transforms;
Cortex.FileStorage = FileStorage;

// Transforms static members
Transforms._transforms = {};

// FileStorage static members
FileStorage._fileStores = {};
// supported models for filestorage list, i.e. data that can be stored in file systems
FileStorage._fsModels = ['csv', 'json', 'jsons', 'jsonl', 'jsona', 'jsono', 'shapes', 'parquet'];

module.exports = exports = Cortex;
