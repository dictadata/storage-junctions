/**
 * storage/transforms/adjoin.js
 */
"use strict";

const { Transform } = require('stream');
const Storage = require("../storage");
const { logger, hasOwnProperty } = require("../utils");

/*
  // example adjoin transform
  transform: {
    adjoin: {
      // properties for loading lookup table
      smt: "<lookup table>",
      options: {},
      pattern: {},

      // field mapping properties
      lookup: {
        "source_field": "lookup_field",
        ...
      },
      inject: "lookup_field" | [lookup_field, ...]
    }
  };
*/

module.exports = exports = class AdjoinTransform extends Transform {

  /**
   *
   * @param {*} options transform options
   */
  constructor(options) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 128
    };
    super(streamOptions);

    this.options = Object.assign({}, options);

    this.lookupMap = new Map();
  }

  _createKey(construct, keys) {
    let key = "";

    for (const fld of keys) {
      key += construct[ fld ];
    }

    return key;
  }

  async activate() {
    logger.debug("adjoin activate");

    let junction;
    try {
      junction = await Storage.activate(this.options.smt, this.options.options);
      let results = await junction.retrieve(this.options.pattern);

      if (results.status === 0) {
        for (const values of results.data) {
          let key = this._createKey(values, Object.values(this.options.lookup));
          this.lookupMap.set(key, values);
        }
      }

      if (typeof this.options.inject === "string")
        this.options.inject = [ this.options.inject ];
    }
    catch (err) {
      logger.error(err);
    }
    finally {
      logger.debug("adjoin relax");
      if (junction) await junction.relax();
    }
  }

  /**
  * Internal call from streamWriter to process an object
  * @param {*} construct
  * @param {*} encoding
  * @param {*} callback
  */
  async _transform(construct, encoding, callback) {
    logger.debug("adjoin _transform");

    try {
      // lookup values in lookup table
      let key = this._createKey(construct, Object.keys(this.options.lookup));
      let values = this.lookupMap.get(key);

      // inject fields from lookup table
      if (values) {
        for (const fld of this.options.inject) {
          if (hasOwnProperty(values, fld))
            construct[ fld ] = values[ fld ];
        }
      }

      this.push(construct);
    }
    catch (err) {
      logger.error(err);
    }

    callback();
  }

  /* optional */
  _flush(callback) {
    callback();
  }

};
