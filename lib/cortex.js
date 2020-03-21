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

  static activate(SMT, options = null) {
    let model = "";
    if (typeof SMT === "string") {
      let a = SMT.split("|");
      model = a[0];
    }
    else if (typeof SMT === "object") {
      model = SMT.model || (SMT.smt && SMT.smt.model);
    }
    else {
      throw new StorageError({statusCode: 400, model: model}, "Invalid parameter: smt.model");
    }

    if (Cortex._storageJunctions.hasOwnProperty(model))
      return new Cortex._storageJunctions[model](SMT, options);
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

module.exports = exports = Cortex;
