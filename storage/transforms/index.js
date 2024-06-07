/**
 * storage/transforms
 */
"use strict";

const { StorageError } = require('../types');

class Transforms {

  static use(transformName, transformClass) {
    // need to do some validation
    Transforms._transforms.set(transformName, transformClass);
  }

  static async activate(transformName, options) {
    if (!transformName)
      throw new StorageError(400, "invalid transform type");

    if (Transforms._transforms.has(transformName)) {
      let transform = new (Transforms._transforms.get(transformName))(options);
      if (typeof transform.activate === "function")
        await transform.activate();
      return transform;
    }
    else
      throw new StorageError(400, "Unknown transform type: " + transformName);
  }

}

// Transforms static properties
Transforms._transforms = new Map();

module.exports = exports = Transforms;
