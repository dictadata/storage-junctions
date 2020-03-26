/**
 * storage/codify
 */
"use strict";

// Infers encoding of a stream of constructs.
// Usage: Pipe a stream of constructs to codify then call getEncoding().
// It is up to the user or application to provide a representative sample of constructs as input.

const StorageWriter = require('./writer');
const Engram = require('../engram');
const Field = require("../field");
const Types = require('../types');
const StorageError = Types.StorageError;
const logger = require('../logger');

const _meta = [ "first_date", "last_date", "count", "nulls", "min_length", "max_length", "min_value", "max_value" ];


module.exports = exports = class CodifyWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   */
  constructor(storageJunction, options) {
    super(storageJunction, null);
    this.options = Object.assign({}, storageJunction.options.codify, options);

    // make a copy of junction's encoding
    this.engram = new Engram(this.engram.smt);

    if (this.options.encoding) {
      let fields = this.options.encoding.fields || this.options.encoding;
      this.engram.fields = fields;
    }

    if (this.options.statistics === true) {
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
  getEncoding() {
    try {
      return this.engram;
    }
    catch(err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  /**
   *  Put an existing encoding.  Call before pipeline is started to initialize the encoding.
   */
  putEncoding(encoding) {
    try {
      this.engram.replace(encoding);
    }
    catch(err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  /**
   * Construe the encoding by examining sample construct(s).
   * "writes" to this.engram
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _write(construct, encoding, callback) {
    this.logger.debug("codify _write");

    try {
      // loop through construct fields
      this.processFields("", this.engram.fields, construct);

      //if (this.options.forEach)
      //  this.options.forEach(construct, this.engram, this.options);

    }
    catch (err) {
      this.logger.error("codify error", err);
    }

    callback();
  }

  _final(callback) {
    this.logger.debug("codify _final");

    // check if any fields are still undefined, i.e. all nulls; default to text
    let default_type = this.options.default_type || "text";
    this.checkDefaults(this.engram.fields, default_type);

    callback();
  }

  /**
   * check construct against current encoding
   * recursive function
   * @param {*} fields
   * @param {*} construct
   */
  processFields(parent, fields, construct, dt = null) {
    this.logger.debug("processFields");

    if (dt === null && this.options.statistics && this.options.statistics.dateField)
      dt = new Date(construct[this.options.statistics.dateField]);

    // loop through the construct
    for (let [name, value] of Object.entries(construct)) {
      // check field name
      let fldname = name;
      if (this.options.notation === "dot" && parent)
        fldname = parent + "." + name;

      // get field definition
      if (!fields[fldname]) {
        if (this.options.statistics)
          fields[fldname] = new Field(fldname, _meta);
        else
          fields[fldname] = new Field(fldname);
      }
      let field = fields[fldname];

      // determine type of value
      let stype = Types.storageType(value);

      // check if field needs an initial type
      if (field.type === "undefined" && stype !== "null") {
        field.type = stype;
      }

      // check if a field's type should be more generalized
      if (stype === "null") {
        // skip the type checks
      }
      else if (field.type === "boolean") {
        if (stype !== "boolean")
          field.type = stype;
      }
      else if (field.type === "integer") {
        if (stype !== "integer")
          field.type = stype;
      }
      else if (field.type === "float") {
        if (stype !== "float" && stype !== "integer")
          field.type = stype;
      }
      else if (field.type === "date") {
        if (stype !== "date")
          field.type = stype;
      }
      else if (field.type === "keyword") {
        if (stype === "text")
          field.type = stype;
      }
      else if (field.type === "fieldmap") {
        if (this.options.notation === "dot") {
          // keep it flat
          this.processFields(fldname, fields, value, dt);
        }
        else {
          // recurse sub-fields
          if (!field.fields) field.fields = {};
          this.processFields("", field.fields, value, dt);
        }
      }
      else if (field.type === "fieldlist") {
        // assume it is a list, i.e. all values must be the same type
        if (value.length > 0) {
          if (this.options.notation === "dot") {
            this.processFields(fldname, fields, value[0], dt);
          }
          else {
            if (!field.fields) field.fields = {};
            this.processFields("", field.fields, value[0], dt);
          }
        }
      }
      else {
        // leave as "undefined"
      }

      //// stats
      if (this.options.statistics) {
        let options = this.options;

        //if (!field._meta)
        //  field._meta = {};

        // seen date
        if (options.statistics.dateField) {
          if (!field["_meta.first_date"] || dt < field["_meta.first_date"])
            field["_meta.first_date"] = dt;
          if (!field["_meta.last_date"] || dt > field["_meta.last_date"])
            field["_meta.last_date"] = dt;
        }

        // count
        if (options.statistics.count) {
          field["_meta.count"] = (field["_meta.count"]) ? field["_meta.count"] + 1 : 1;
        }

        // nulls
        if (options.statistics.nulls && value === null) {
          field["_meta.nulls"] = (field["_meta.nulls"]) ? field["_meta.nulls"] + 1 : 1;
        }

        // length
        if (options.statistics.length && (field.type === "keyword" || field.type === "text") && (value !== null)) {
          let len = value.length;
          if (!field["_meta.min_length"] || len < field["_meta.min_length"])
            field["_meta.min_length"] = len;
          if (!field["_meta.max_length"] || len > field["_meta.max_length"])
            field["_meta.max_length"] = len;
        }

        // min and max
        if ((field.type === "keyword" || field.type === "integer" || field.type === "float" || field.type === "date") && value !== null) {
          if (options.statistics.minimum  && (!field["_meta.min_value"] || value < field["_meta.min_value"]))
            field["_meta.min_value"] = value;
          if (options.statistics.maximum  && (!field["_meta.max_value"] || value > field["_meta.max_value"]))
            field["_meta.max_value"] = value;
        }
      }

    }
  }

  /**
   * recursive function
   * @param {*} fields
   * @param {*} default_type
   */
  checkDefaults(fields, default_type) {

    for (let field of Object.values(fields)) {
      if (field.type === "undefined")
        field.type = default_type;
      else if (field.type === "fieldmap" || field.type === "fieldlist") {
        if (field.fields && (!this.options.notation || this.options.notation !== "dot"))
          this.checkDefaults(field.fields, default_type);  // recurse sub-fields
      }
    }

  }

};

