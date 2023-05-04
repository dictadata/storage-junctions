/**
 * transform/codify
 */
"use strict";

// Infers encoding from a stream of constructs.
// Usage: Pipe a stream of constructs to codifyTransform then read the stream output or get encoding property.
// It is up to the application to provide a representative sample of constructs as input.

const { Transform } = require('stream');
const { Field, Engram, storageType } = require('../types');
const { logger } = require("../utils");


module.exports = exports = class CodifyTransform extends Transform {

  /**
   *
   * @param {*} options transform options
   *   options.encoding       defaults to null
   *   options.default_type   defaults to "text"
   *   options.notation       defaults to null (json nesting), other values: "dot"
   */
  constructor(options) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 128
    };
    super(streamOptions);

    this.options = Object.assign({}, options);

    // engram for storing encoding
    this.engram = new Engram('*|*|*|*');

    if (this.options.encoding)
      this.engram.merge(this.options.encoding);
  }

  /**
   *  Get the recognized encoding.  Call after the pipeline is finished.
   */
  get encoding() {
    try {
      if (this.options.notation === "dot")
        return this.flatten();
      else
        return this.engram.encoding;
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *  Put an existing encoding.  Call before pipeline is started to initialize the encoding.
   */
  set encoding(encoding) {
    try {
      this.engram.encoding = encoding;
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   * Construe the encoding by examining sample construct(s).
   * Updates field encodings in this.engram.
   *
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(construct, encoding, callback) {
    logger.debug("codify _transform");

    try {
      // loop through construct fields
      this.processConstruct(construct, this.engram.fields);
    }
    catch (err) {
      logger.error("codify error", err);
    }

    callback();
  }

  _final(callback) {
    logger.debug("codify _final");

    // check if any fields are still undefined, i.e. all nulls; default to text
    let default_type = this.options.default_type || "text";
    this.checkDefaults(this.engram.fields, default_type);

    this.push(this.engram.fields);
    callback();
  }

  /**
   * check construct against current encoding
   * recursive function
   * @param {*} parent - The parent name used for dot notation, can be a nested dot notation name.
   * @param {*} fields - The child field encodings.
   * @param {*} construct - A construct containing sample data of the schema.
   */
  processConstruct(construct, fields) {
    logger.debug("processConstruct");

    // loop through the construct
    for (let [ name, value ] of Object.entries(construct)) {
      // get field definition
      let field = fields.find((f) => f.name === name);
      if (!field) {
        field = new Field(name);
        fields.push(field);
      }

      this.processValue(value, field);
    }
  }

  processValue(value, field) {
    // determine type of value
    let stype = storageType(value);

    // check if field needs an initial type
    if (field.type === "unknown" && stype !== "unknown") {
      field.type = stype;
      //if (stype === "integer" && (value === 0 || value === 1))
      //  field.type = "boolean";
    }

    // check if a field's type should be more generalized
    if (stype === "unknown") {
      // null value, skip the type checks
    }
    else if (field.type === "boolean") {
      if (stype !== "boolean")
        field.type = stype;
    }
    else if (field.type === "integer") {
      if (stype !== "integer")
        field.type = stype;
    }
    else if (field.type === "number") {
      if (stype !== "number" && stype !== "integer")
        field.type = stype;
    }
    else if (field.type === "date") {
      if (stype !== "date")
        field.type = stype;
    }
    else if (field.type === "keyword") {
      if (stype === "text")
        field.type = stype;
      else if (stype !== "keyword") {
        // leave as keyword for numbers, etc.
      }
      if (!field.size || field.size < value.length)
        field.size = value.length;
    }
    else if (field.type === "text" || field.type === "string") {
      if (stype !== "text" && stype !== "string") {
        // leave as text for numbers, etc.
      }
      if (!field.size || field.size < value.length)
        field.size = value.length;
    }
    else if (field.type === "map") {
      if (stype !== "map") {
        field.type = "variable";  // item can hold any type
      }
      else {
        // process nested fields
        if (!field.fields)
          field.fields = [];
        this.processConstruct(value, field.fields);
      }
    }
    else if (field.type === "list") {
      if (stype !== "list") {
        // assume individual item instead of array of item
        if (field._list) {
          if (stype !== field._list.type
            && !(stype === "integer" && field._list.type === "number")
            && !(stype === "keyword" && field._list.type === "text")
          )
            field.type = "variable";
        }
      }
      else {
        // process array values
        if (!field._list)
          field._list = new Field("_list");
        try {
          for (let item of value)
            this.processValue(item, field._list);
        }
        catch (err) {
          logger.error(err);
        }
      }
    }
    else {
      // leave as "unknown"
    }
  }

  /**
   * checkDefaults by scanning the encodings looking for undefined field.type values and sets them to options.default_type.
   * recursive function
   * @param {*} fields
   * @param {*} default_type
   */
  checkDefaults(fields, default_type) {

    for (let field of fields) {
      if (field.type === "unknown")
        field.type = default_type;
      else if (field.type === "list") {
        if (field._list?.type === "unknown")
          field._list.type = default_type;
      }
      else if (field.type === "map") {
        if (field.fields)
          this.checkDefaults(field.fields, default_type);  // recurse sub-fields
      }
    }

  }

  flatten() {

  }
};
