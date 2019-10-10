/**
 * storage/cortex
 *
 * A strategy for creating a storage node given a storage path.
 *
 */
"use strict";

const {StorageError} = require("./types");

class Cortex {

  static use(model,storageJunctionConstructor) {
    // need to do some validation
    Cortex._storageJunctions[model] = storageJunctionConstructor;
  }

  static activate(storagePath, options = null) {
    let model = "";
    if (typeof storagePath === "string") {
      let smt = storagePath.split("|");
      model = smt[0];
    }
    else if (typeof storagePath === "object") {
      model = (storagePath.smt && storagePath.smt.model) || storagePath.model;
    }
    else {
      throw new StorageError({statusCode: 400, model: model}, "Invalid parameter: smt.model");
    }

    if (Cortex._storageJunctions.hasOwnProperty(model))
      return new Cortex._storageJunctions[model](storagePath,options);
    else
      throw new StorageError({statusCode: 400, model: model}, "Unknown smt.model: " + model);
  }

  static relax(junction) {
    // developers should call this instead of junction.relax()
    // could implement some pool or tracking or something here

    junction.relax();
  }
}

Cortex._storageJunctions = {};

module.exports = Cortex;
