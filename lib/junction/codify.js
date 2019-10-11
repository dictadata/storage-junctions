/**
 * storage/codify
 */
"use strict";

// Infer encoding of a stream of constructs.
// Implements storage writer class.  Store a stream of constucts then get the encoding.
// It is up to the user or application to provide a representative sample of constructs as input.

const { Transform } = require('stream');
const Field = require("../field");
const Types = require('../types');
const Engram = require('../engram');
const StorageError = Types.StorageError;
const logger = require('../logger');

module.exports = class Codify extends Transform {

  /**
   *
   * @param {*} storageJunction
   */
  constructor(storageJunction, options = null) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 64
    };
    super(streamOptions);

    this._junction = storageJunction;
    if (!this._junction.hasOwnProperty("_engram"))
      throw new StorageError({statusCode: 400}, "Invalid parameter: storageJunction");

    this._options = options || {};
    this._logger = this._options.logger || storageJunction._logger;

    this.engram = new Engram("*|*|*|*");
  }

  /**
   *  Get the recognized encoding.  Call after the pipeline is finished.
   */
  async getEncoding() {
    try {
      return this.engram;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   * Construe the encoding by examining sample construct(s).
   * @param {*} construct
   */
  _transform(construct, encoding, callback) {
    logger.debug("codify _transform");

    try {
      // loop through construct fields
      for (let [name, value] of Object.entries(construct)) {
        // get current field encoding, if any
        var field = this.engram.fields[name] || this.engram.add(new Field(name));

        /* check value of construct field against field's current encoding */
        let stype = Types.storageType(value);

        if (field.type === "undefined" && stype !== "null")
          field.type = stype;

        if (field.type === "boolean") {
          if (stype !== "boolean" && stype !== "null")
            field.type = stype;
        } else if (field.type === "float") {
          if (stype !== "float" && stype !== "integer" && stype !== "null")
            field.type = stype;
        } else if (field.type === "integer") {
          if (stype === "float")
            field.type = "float";
          else if (stype !== "integer" && stype !== "null")
            field.type = stype;
        } else if (field.type === "date") {
          if (stype !== "date" && stype !== "null")
            field.type = stype;
        } else if (field.type === "keyword") {
          if (stype === "text")
            field.type = stype;
        } else {
          // undefined
        }
      }
    }
    catch (err) {
      logger.debug("codify error", err);
    }

    callback();
  }

  _flush(callback) {
    logger.debug("codify _flush");

    // check if any fields are still undefined, i.e. all nulls; default to keyword
    let default_type = this._options.default_type || "keyword";

    for (let [name, field] of Object.entries(this.engram.fields)) {
      if (field.type === "undefined") {
        field.type = default_type;
      }
    }

    this.push(this.engram.fields);
    callback();
  }

};
