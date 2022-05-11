/**
 * storage/transforms/adjoin.js
 */
"use strict";

const { Transform } = require('stream');
const Cortex = require("../cortex");
const { logger, hasOwnProperty } = require("../utils");

/*
  // example adjoin transform
  transform: {
    adjoin: {
      smt: "<lookup table>",
      options: {
      },
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

    this.lookup = {};
    let entries = Object.entries(this.options.lookup);
    this.srcField = Object.keys(this.options.lookup)[ 0 ];
    this.lookField = Object.values(this.options.lookup)[ 0 ];
  }

  async activate() {
    let junc;
    try {
      junc = await Cortex.activate(this.options.smt, this.options.options);
      let results = await junc.retrieve();

      if (results.resultCode === 0) {
        for (const values of results.data)
          if (hasOwnProperty(values, this.lookField))
            this.lookup[ values[ this.lookField ] ] = values;
      }
    }
    catch (err) {
      logger.error(err);
    }
    finally {
      logger.debug("adjoin relax");
      if (junc) await junc.relax();
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
      // lookup source field in lookup table
      let values = this.lookup[ construct[ this.srcField ] ];

      // inject fields from lookup table
      for (const fld of this.options.inject) {
        if (hasOwnProperty(values, fld))
          construct[ fld ] = values[ fld ];
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
    // push the final object(s)
    //let newConstruct = {};
    //this.push(newConstruct);

    callback();
  }

};
