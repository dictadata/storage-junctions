/**
 * storage/transforms/adjoin.js
 */
"use strict";

const { Transform } = require('node:stream');
const Storage = require('../storage');
const { logger } = require('@dictadata/lib');
const { dot, evaluate, match } = require('@dictadata/lib');

/* adjoin transform definition

  {
    transform: "adjoin",
    smt: "",
    options: {},
    pattern: {},
    lookup: {
      "lookup_field": "=construct_field|'literal'+..."
    }
    "inject": "inject_field" | [ "inject_field", ... ]
  };

  lookup_table - contains rows retrieved from lookup_table data source
  lookup - is a match expression for the lookup_table
  lookup_field - fields(s) to match in the lookup_table
  construct_field - get values from the streaming constructs
  inject_field - field(s) from the found lookup row to inject into construct, "*" for all
*/

/* example adjoin transform

var transform = {
  "transform": "adjoin",
  "lookup_table": {
    "smt": "census.gov:ansi_county",
    "pattern": {
      "STATE": "IA"
    }
  },
  "lookup": {
    "STATENAME": "=County+' County'"
  },
  "inject": [ "STATEFP" ]
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
      highWaterMark: 32
    };
    super(streamOptions);

    this.options = Object.assign({}, options);

    this.lookupTable;
  }

  async activate() {
    logger.debug("adjoin activate");

    let origin = this.options;

    let junction;
    try {
      junction = await Storage.activate(origin.smt, origin.options);

      let pattern = Object.assign({ count: 1000 }, origin.pattern);
      let results = await junction.retrieve(pattern);
      if (results.status === 0) {
        if (results.type === "map")
          this.lookupTable = Object.values(results.data);
        else
          this.lookupTable = results.data;
        logger.verbose("lookupTable: " + this.lookupTable.length);
      }
      else
        logger.warn(results.status + " " + results.message);
    }
    catch (err) {
      logger.warn(err.message);
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
      let expression = Object.assign({}, this.options.lookup);
      for (let [ name, criteria ] of Object.entries(expression)) {
        dot.set(expression, name, evaluate(criteria, construct));
      }

      // lookup values in lookup table
      let foundRow;
      if (this.lookupTable) {
        for (let row of this.lookupTable) {
          if (match(expression, row)) {
            foundRow = row;
            break;
          }
        }
      }

      // inject fields from lookup table
      if (foundRow) {
        if (this.options.inject === "*") {
          for (const [fld, value] of Object.entries(foundRow)) {
            construct[ fld ] = value;
          }
        }
        else if (typeof this.options.inject === "string") {
          let fld = this.options.inject;
          if (Object.hasOwn(foundRow, fld))
            construct[ fld ] = foundRow[ fld ];
        }
        else if (Array.isArray(this.options.inject)) {
          for (const fld of this.options.inject) {
            if (Object.hasOwn(foundRow, fld))
              construct[ fld ] = foundRow[ fld ];
          }
        }
      }
      else {
        console.warn("lookup not found: ", expression);
      }

      this.push(construct);
    }
    catch (err) {
      logger.warn(err.message);
    }

    callback();
  }

  /*
    _flush(callback) {
      logger.debug("transform _flush");

      // push some final object(s)
      //this.push(this._composition);

      callback();
    }
  */
};
