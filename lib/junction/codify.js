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

module.exports = class CodifyWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    if (this._options.encoding) {
      let fields = this._options.encoding.fields || this._options.encoding;
      this._engram.fields = fields;
    }
  }

  /**
   *  Get the recognized encoding.  Call after the pipeline is finished.
   */
  getEncoding() {
    try {
      return this._engram;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *  Put an existing encoding.  Call before pipeline is started to add to the encoding.
   */
  putEncoding(encoding) {
    try {
      this._engram.replace(encoding);
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   * Construe the encoding by examining sample construct(s).
   * "writes" to this._engram
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _write(construct, encoding, callback) {
    logger.debug("codify _write");

    try {
      // loop through construct fields
      this._processFields(this._engram.fields, construct);

      //if (this._options.forEach)
      //  this._options.forEach(construct, this._engram, this._options.options);

    }
    catch (err) {
      logger.error("codify error", err);
    }

    callback();
  }

  _final(callback) {
    logger.debug("codify _final");

    // check if any fields are still undefined, i.e. all nulls; default to keyword
    let default_type = this._options.default_type || "keyword";
    this._checkDefaults(this._engram.fields, default_type);

    callback();
  }

  /**
   * recursive function
   * @param {*} fields
   * @param {*} construct
   */
  _processFields(fields, construct, dt = null) {
    logger.debug("processFields");

    if (dt === null && this._options.statistics && this._options.statistics.dateField)
      dt = new Date(construct[this._options.statistics.dateField]);

    for (let [name, value] of Object.entries(construct)) {

      if (!fields[name])
        fields[name] = new Field(name);
      let field = fields[name];

      ///// check value of construct field against field's current encoding
      let stype = Types.storageType(value);

      // assign an initial field type
      if (field.type === "undefined" && stype !== "null") {
        field.type = stype;
      }
      if (stype === "null")
        continue;

      // check if a field type should be more generalized
      if (field.type === "boolean") {
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
      else if (field.type === "object") {
        if (!field.fields)
          field.fields = {};
        this._processFields(field.fields, value, dt);
      }
      else if (field.type === "array") {
        if (!field.fields)
          field.fields = {};
        // assume it is a "data array", only check the first value
        this._processFields(field.fields, (value.length > 0) ? value[0] : {}, dt);
      }
      else {
        // undefined
      }

      //// stats
      if (this._options.statistics) {
        let options = this._options;

        if (!field._statistics)
          field._statistics = {};

        // seen date
        if (options.statistics.dateField) {
          if (!field._statistics.first_date || dt < field._statistics.first_date)
            field._statistics.first_date = dt;
          if (!field._statistics.last_date || dt > field._statistics.last_date)
            field._statistics.last_date = dt;
        }

        // count
        if (options.statistics.count) {
          field._statistics.count = (field._statistics.count) ? field._statistics.count + 1 : 1;
        }

        // nulls
        if (options.statistics.nulls && value === null) {
          field._statistics.nulls = (field._statistics.null) ? field._statistics.null + 1 : 1;
        }

        // length
        if (options.statistics.length && (field.type === "keyword" || field.type === "text") && (value !== null)) {
          let len = value.length;
          if (!field._statistics.min_length || len < field._statistics.min_length)
            field._statistics.min_length = len;
          if (!field._statistics.max_length || len > field._statistics.max_length)
            field._statistics.max_length = len;
        }

        // min and max
        if ((field.type === "keyword" || field.type === "integer" || field.type === "float" || field.type === "date") && value !== null) {
          if (options.statistics.minimum  && (!field._statistics.min_value || value < field._statistics.min_value))
            field._statistics.min_value = value;
          if (options.statistics.maximum  && (!field._statistics.max_value || value > field._statistics.max_value))
            field._statistics.max_value = value;
        }
      }

    }
  }

  /**
   * recursive function
   * @param {*} fields
   * @param {*} default_type
   */
  _checkDefaults(fields, default_type) {

    for (let field of Object.values(fields)) {
      if (field.type === "undefined")
        field.type = default_type;
      else if (field.type === "object" || field.type === "array")
        this._checkDefaults(field.fields, default_type);
    }

  }

};

