// Storage Cortex
// A stragegy for creating a storage node given a storage path.

"use strict";

const Engram = require("./engram");
//const StorageJunction = require("./junction");

class Cortex {

  static use(scheme,storageJunctionConstructor) {
    // need to do some validation
    Cortex._storageJunctions[scheme] = storageJunctionConstructor;
  }

  static activate(storagePath, options = null) {
    let scheme = "";
    if (typeof storagePath === "string") {
      let smt = storagePath.split("|");
      scheme = smt[0];
    }
    else if (storagePath instanceof Engram) {
      scheme = storagePath.scheme;
    }
    else {
      throw new Error("Invalid parameter: scheme");
    }

    if (Cortex._storageJunctions.hasOwnProperty(scheme))
      return new Cortex._storageJunctions[scheme](storagePath,options);
    else
      throw new Error("Unknown engram scheme: " + scheme);
  }

  static relax(junction) {
    // developers should call this instead of junction.relax()
    // could implement some pool or tracking or something here

    junction.relax();
  }
}

Cortex._storageJunctions = {};

module.exports = Cortex;
