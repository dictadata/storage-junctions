/**
 * transform/codify
 */
"use strict";

// Infers encoding from a stream of constructs.
// Usage: Pipe a stream of constructs to codifyTransform then read the stream output or get encoding property.
// It is up to the application to provide a representative sample of constructs as input.

const { Transform } = require('node:stream');
const { Engram, Fields, Field, storageType } = require('../types');
const { logger } = require('@dictadata/lib');
const { typeOf } = require('@dictadata/lib');

module.exports = exports = class CodifyTransform extends Transform {

  /**
   *
   * @param {object} options transform options
   * @param {object} options.encoding      start with an encoding, defaults to undefined
   * @param {string} options.defaultType   a storage type, defaults to 'text'
   * @param {string} options.missingValue  a value like '-' or '*' that represents missing values in the source, defaults to undefined
   */
  constructor(options) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 32
    };
    super(streamOptions);
    logger.debug("codify constructor");

    this.options = Object.assign({}, options);

    // engram for storing encoding
    this.engram = new Engram('*|*|*|*');
    this.engram.name = options.name || options.encoding?.name || "codify";
    if (this.options.encoding) {
      this.engram.encoding = options.encoding;
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
      logger.warn("codify error: " + err.message);
    }

    callback();
  }

  _flush(callback) {
    logger.debug("codify _flush");

    // check if any fields are still undefined, i.e. all nulls; default to text
    let defaultType = this.options.defaultType || "text";
    this.checkDefaults(this.engram.fields, defaultType);

    this.push(this.engram.encoding);
    callback();
  }

  /**
   * check construct against current encoding
   * recursive function
   * @param {*} construct - A construct containing sample data of the schema.
   * @param {*} fields - The child field encodings.
   */
  processConstruct(construct, fields) {
    logger.debug("processConstruct");

    // loop through the construct
    for (let [ name, value ] of Object.entries(construct)) {
      // get field definition
      if (!fields.find)
        debugger;
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

    if (Object.hasOwn(this.options, "missingValue") && (value === this.options.missingValue)) {
      stype = "unknown";
      value = null;
    }

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
      if ((stype !== "boolean") && !(stype === "integer" && (value === 0 || value === 1)))
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
        else if (typeOf(field.fields) === "object")
          field.fields = Fields.Convert(field.fields);

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
          logger.warn(err.message);
        }
      }
    }
    else {
      // leave as "unknown"
    }
  }

  /**
   * checkDefaults by scanning the encodings looking for undefined field.type values and sets them to options.defaultType.
   * recursive function
   * @param {*} fields
   * @param {*} defaultType
   */
  checkDefaults(fields, defaultType) {

    for (let field of fields) {
      if (field.type === "unknown")
        field.type = defaultType;
      else if (field.type === "list") {
        if (field._list?.type === "unknown")
          field._list.type = defaultType;
      }
      else if (field.type === "map") {
        if (field.fields)
          this.checkDefaults(field.fields, defaultType);  // recurse sub-fields
      }
    }

  }

};
