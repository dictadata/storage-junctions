/**
 * storage/transforms/flowstats
 *
 * collect data on meta statistics for each field
 */
"use strict";

// Calculate summary statistics from a stream of constructs.
// It is up to the application to provide a representative sample of constructs as input.

const { Transform } = require('node:stream');
const { Field, Engram } = require('../types');
const { logger } = require('@dictadata/lib');


const _meta = [ "first_date", "last_date", "count", "nulls", "min_length", "max_length", "min_value", "max_value" ];


module.exports = exports = class FlowStatsTransform extends Transform {

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

    // engram for storing encoding
    this.engram = new Engram('*|*|*|*');
    this.engram.name = options.name || options.encoding?.name || "codify";
    if (this.options.encoding) {
      this.engram.encoding = options.encoding;
    }

    if (!this.options.statistics) {
      this.options.statistics = {
        dateField: null,
        count: true,
        nulls: true,
        length: true,
        minimum: true,
        maximum: true
      };
    }
  }

  /**
   *  Get the recognized encoding.  Call after the pipeline is finished.
   */
  get encoding() {
    try {
      return this.engram.encoding;
    }
    catch (err) {
      logger.warn(err.message);
      throw err;
    }
  }

  /**
   * Calculate field statistics by examining construct(s).
   * Stores stats to this.engram.fields.
   *
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(construct, encoding, callback) {
    logger.debug("flowstats _transform");

    try {
      // loop through construct fields
      this.processFields("", construct);

      //if (this.options.forEach)
      //  this.options.forEach(construct, this.engram, this.options);

    }
    catch (err) {
      logger.warn("flowstats error: " + err.message);
    }

    callback();
  }

  _flush(callback) {
    logger.debug("flowstats _flush");

    this.push(this.engram.fields);

    callback();
  }

  /**
   * Update field meta statistics.
   * recursive function
   * @param {*} fields
   * @param {*} construct
   */
  processFields(parent, construct, dt = null) {
    logger.debug("processFields");

    if (dt === null && this.options.statistics.dateField)
      dt = new Date(construct[ this.options.statistics.dateField ]);

    // loop through the construct
    for (let [ name, value ] of Object.entries(construct)) {
      // check field name
      let fldname = name;
      if (this.options.notation === "dot" && parent)
        fldname = parent + "." + name;

      // get field definition
      let field = this.engram.find(fldname);
      if (!field) {
        field = new Field(fldname, _meta);
        this.engram.add(field);
      }

      //// stats
      let options = this.options;

      //if (!field._meta)
      //  field._meta = {};

      // seen date
      if (options.statistics.dateField) {
        if (!field[ "_meta.first_date" ] || dt < field[ "_meta.first_date" ])
          field[ "_meta.first_date" ] = dt;
        if (!field[ "_meta.last_date" ] || dt > field[ "_meta.last_date" ])
          field[ "_meta.last_date" ] = dt;
      }

      // count
      if (options.statistics.count) {
        field[ "_meta.count" ] = (field[ "_meta.count" ]) ? field[ "_meta.count" ] + 1 : 1;
      }

      // nulls
      if (options.statistics.nulls && (value === undefined || value === null)) {
        field[ "_meta.nulls" ] = (field[ "_meta.nulls" ]) ? field[ "_meta.nulls" ] + 1 : 1;
      }

      // length
      if (options.statistics.length && (field.type === "keyword" || field.type === "text" || field.type === "string") && (value !== null)) {
        let len = value.length;
        if (!field[ "_meta.min_length" ] || len < field[ "_meta.min_length" ])
          field[ "_meta.min_length" ] = len;
        if (!field[ "_meta.max_length" ] || len > field[ "_meta.max_length" ])
          field[ "_meta.max_length" ] = len;
      }

      // min and max
      if ((field.type === "keyword" || field.type === "integer" || field.type === "number" || field.type === "date") && value !== null) {
        if (options.statistics.minimum && (!field[ "_meta.min_value" ] || value < field[ "_meta.min_value" ]))
          field[ "_meta.min_value" ] = value;
        if (options.statistics.maximum && (!field[ "_meta.max_value" ] || value > field[ "_meta.max_value" ]))
          field[ "_meta.max_value" ] = value;
      }
    }

  }

};
