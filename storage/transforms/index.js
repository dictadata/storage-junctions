/**
 * storage/transforms
 */
"use strict";

const { StorageError } = require("../types");

class Transforms {

  static use(tfType, transformClass) {
    // need to do some validation
    Transforms._transforms.set(tfType, transformClass);
  }

  static async activate(tfType, options) {
    if (!tfType)
      throw new StorageError(400, "invalid transform type");

    if (Transforms._transforms.has(tfType)) {
      let transform = new (Transforms._transforms.get(tfType))(options);
      if (typeof transform.activate === "function")
        await transform.activate();
      return transform;
    }
    else
      throw new StorageError(400, "Unknown transform type: " + tfType);
  }

}

// Transforms static properties
Transforms._transforms = new Map();

module.exports = exports = Transforms;
