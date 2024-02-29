/**
 * storage/transforms/adjoin.js
 */
"use strict";

const { Transform } = require('stream');
const Storage = require("../storage");
const { logger, hasOwnProperty } = require("../utils");
const evaluate = require("../utils/evaluate");
const match = require("../utils/match");

/* adjoin transform definition

  {
    transform: "adjoin",
    lookup_table: {
      smt: "",
      options: {},
      pattern: {}
    },
    lookup: {
      "lookup_field": "=construct_field|'literal'+..."
    }
    "inject": "inject_field" | [ "inject_field", ... ]
  };

  lookup_table - contains rows retrieved from lookup_table data source
  lookup - is a match expression for the lookup_table
  lookup_field - fields(s) to match in the lookup_table
  construct_field - get values from the streaming constructs
  inject_field - field(s) from the found lookup row to inject into construct
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
      highWaterMark: 128
    };
    super(streamOptions);

    this.options = Object.assign({}, options);
    if (typeof this.options.inject === "string")
      this.options.inject = [ this.options.inject ];

    this.lookupTable;
  }

  async activate() {
    logger.debug("adjoin activate");

    let origin = this.options.lookup_table;

    let junction;
    try {
      junction = await Storage.activate(origin.smt, origin.options);

      let results = await junction.retrieve(origin.pattern);
      if (results.status === 0) {
        if (results.type === "map")
          this.lookupTable = Object.values(results.data);
        else
          this.lookupTable = results.data;
      }
    }
    catch (err) {
      logger.warn(err);
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
        expression[ name ] = evaluate(criteria, construct);
      }

      // lookup values in lookup table
      let found;
      for (let row of this.lookupTable) {
        if (match(expression, row)) {
          found = row;
          break;
        }
      }

      // inject fields from lookup table
      if (found) {
        for (const fld of this.options.inject) {
          if (hasOwnProperty(found, fld))
            construct[ fld ] = found[ fld ];
        }
      }

      this.push(construct);
    }
    catch (err) {
      logger.warn(err);
    }

    callback();
  }

  /* optional */
  _flush(callback) {
    callback();
  }

};
