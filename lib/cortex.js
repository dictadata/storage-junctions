// Storage Cortex
// A stragegy for creating a storage node given a storage path.

"use strict";

const Engram = require("./engram");
//const StorageJunction = require("./junction");

class Cortex {

  static use(storageType,storageJunctionConstructor) {
    // need to do some validation
    Cortex._storageJunctions[storageType] = storageJunctionConstructor;
  }

  static create(storagePath, options = null) {
    let storageType = "";
    if (typeof storagePath === "string") {
      let smt = storagePath.split("|");
      storageType = smt[0];
    }
    else if (storagePath instanceof Engram) {
      storageType = storagePath.type;
    }
    else {
      throw new Error("Invalid parameter: storageType");
    }

    if (Cortex._storageJunctions.hasOwnProperty(storageType))
      return new Cortex._storageJunctions[storageType](storagePath,options);
    else
      throw new Error("Unknown storage type: " + storageType);
  }

}

Cortex._storageJunctions = {};

module.exports = Cortex;
