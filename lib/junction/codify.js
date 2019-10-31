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
  constructor(storageJunction, options = null) {
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
   */
  _write(construct, encoding, callback) {
    logger.debug("codify _write");

    try {
      // loop through construct fields
      construeType(this._engram.fields, construct);

      if (this._options.forEach)
        this._options.forEach(construct, this._engram);
    }
    catch (err) {
      logger.debug("codify error", err);
    }

    callback();
  }

  _final(callback) {
    logger.debug("codify _final");

    // check if any fields are still undefined, i.e. all nulls; default to keyword
    let default_type = this._options.default_type || "keyword";
    checkDefaults(this._engram.fields, default_type);

    callback();
  }

};

/**
 *
 * @param {*} fields
 * @param {*} construct
 */
function construeType(fields, construct) {
  logger.debug("construeType");

  for (let [name, value] of Object.entries(construct)) {

    if (!fields[name])
      fields[name] = new Field(name);
    let field = fields[name];

    /* check value of construct field against field's current encoding */
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
      construeType(field.fields, value);
    }
    else if (field.type === "array") {
      if (!field.fields)
        field.fields = {};
      // assume it is a "data array", only check the first value
      construeType(field.fields, (value.length > 0) ? value[0] : {});
    }
    else {
      // undefined
    }

  }
}

function checkDefaults(fields, default_type) {

  for (let field of Object.values(fields)) {
    if (field.type === "undefined")
      field.type = default_type;
    else if (field.type === "object" || field.type === "array")
      checkDefaults(field.fields, default_type);
  }

}
