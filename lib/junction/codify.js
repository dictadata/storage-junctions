"use strict";

// Infer encoding of a stream of constructs.
// Implements storage writer class.  Store a stream of constucts then get the encoding.
// It is up to the user or application to provide a representative sample of constructs as input.

const { Transform } = require('stream');
const Encoding = require("../encoding");
const Field = require("../field");
const Types = require('../types');

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
    if (!this._junction.hasOwnProperty("_encoding"))
      throw new Error("Invalid parameter: storageJunction");

    this._options = options || {};
    this._logger = this._options.logger || storageJunction._logger;

    this.encoding = new Encoding('any|||*');
    this.encoding.merge(this._junction._encoding);
  }

  /**
   *  Get the recognized encoding.  Call after the pipeline is finished.
   */
  async getEncoding() {
    try {
      return this.encoding;
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
    //console.log("codify _transform");

    try {
      let keys = Object.keys(construct);
      let values = Object.values(construct);

      // loop through construct fields
      for (let i = 0; i < keys.length; i++) {
        // get current field encoding, if any
        var field = this.encoding.find(keys[i]);
        if (field === null) {
          // lets add a new field
          //console.log("new field");
          field = new Field(keys[i]);
          this.encoding.add(field);
        }

        /* check value of construct field against field's current encoding */
        let value = values[i];
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
      console.log("codify error", err);
    }

    callback();
  }

  _flush(callback) {
    //console.log("codify _flush");

    // check if any fields are still undefined, i.e. all nulls; default to keyword
    let default_type = this._options.default_type || "keyword";

    for (let i = 0; i < this.encoding.fields.length; i++) {
      let encfield = this.encoding.fields[i];
      if (encfield.type === "undefined") {
        encfield.type = default_type;
      }
    }

    this.push(this.encoding.fields);
    callback();
  }

};
