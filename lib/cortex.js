/**
 * storage/cortex
 *
 * A strategy for creating a storage node given a storage path.
 *
 */
"use strict";

const { StorageError } = require("./types");

class Cortex {

  static use(model, storageJunctionConstructor) {
    // need to do some validation
    Cortex._storageJunctions[model] = storageJunctionConstructor;
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
      throw new StorageError({ statusCode: 400, model: model }, "Invalid parameter: smt.model");
    }

    if (Object.prototype.hasOwnProperty.call(Cortex._storageJunctions, model)) {
      let junction = new Cortex._storageJunctions[model](SMT, options);
      await junction.activate();
      return junction;
    }
    else
      throw new StorageError({ statusCode: 400, model: model }, "Unknown smt.model: " + model);
  }

  static relax(junction) {
    // developers should call this instead of junction.relax()
    // could implement some pool or tracking or something here

    junction.relax();
  }


  static useFS(fsType, fileStorageConstructor) {
    // need to do some validation
    Cortex._fileStorage[fsType] = fileStorageConstructor;
  }

  static async activateFS(SMT, options) {
    if (!SMT)
      throw new StorageError({ statusCode: 400 }, "invalid smt");
    if (!Cortex._fsModels.includes(SMT.model))
      throw new StorageError({ statusCode: 400 }, "invalid model");

    let fsType = 'fs';
    if (SMT.locus.includes(':'))
      fsType = SMT.locus.split(':')[0].toLowerCase();

    if (Object.prototype.hasOwnProperty.call(Cortex._fileStorage, fsType)) {
      let fst = new Cortex._fileStorage[fsType](SMT, options);
      await fst.activate();
      return fst;
    }
    else
      throw new StorageError({ statusCode: 400, fsType: fsType }, "Unknown FileStorage type: " + fsType);
  }

}

// static members

Cortex._storageJunctions = {};
Cortex._fileStorage = {};
// supported models for filestorage scans
Cortex._fsModels = ['csv', 'json', 'jsons', 'jsonl', 'jsona', 'jsono'];

module.exports = exports = Cortex;
