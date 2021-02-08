/**
 * transform/codify
 */
"use strict";

// Infers encoding from a stream of constructs.
// Usage: Pipe a stream of constructs to codifyTransform then read the stream output or call getEncoding().
// It is up to the application to provide a representative sample of constructs as input.

const { Transform } = require('stream');
const Engram = require('../engram');
const Field = require("../field");
const Types = require('../types');
const logger = require('../logger');


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
    this.engram = new Engram('any|*|*|*');

    if (Types.typeOf(this.options.encoding) === 'object') {
      this.engram.fields = this.options.encoding.fields || this.options.encoding;
      // Note at this point engram.fields will point to the same object as:
      //    options.encoding.fields (precedence)
      // This can be used by scan functionality to preserve encodings between processing each schema.
    }
  }

  /**
   *  Get the recognized encoding.  Call after the pipeline is finished.
   */
  getEncoding() {
    try {
      if (this.options.notation === "dot")
        return flatten();
      else
        return this.engram;
    }
    catch (err) {
      logger.error(err);
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
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   * Construe the encoding by examining sample construct(s).
   * Updates field encodings in this.engram.fields.
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

    this.push(this.engram.fields)
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
    for (let [name, value] of Object.entries(construct)) {
      // get field definition
      if (!fields[name]) {
        fields[name] = new Field(name);
      }
      let field = fields[name];

      this.processValue(value, field);
    }
  }

  processValue(value, field) {
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
      if (field.size < value.length)
        field.size = value.length;
    }
    else if (field.type === "text") {
      if (field.size < value.length)
        field.size = value.length;
    }
    else if (field.type === "map") {
      // process nested fields
      if (!field.fields)
        field.fields = {};
      this.processConstruct(value, field.fields);
    }
    else if (field.type === "list") {
      // assume it is an array AND all values must be the same type
      if (!field._item)
        field._item = new Field("_item");
      for (let item of value)
        this.processValue(item, field._item);
    }
    else {
      // leave as "undefined"
    }
  }

  /**
   * checkDefaults by scanning the encodings looking for undefined field.type values and sets them to options.default_type.
   * recursive function
   * @param {*} fields
   * @param {*} default_type
   */
  checkDefaults(fields, default_type) {

    for (let field of Object.values(fields)) {
      if (field.type === "undefined")
        field.type = default_type;
      else if (field.type === "list") {
        if (field._item && field._item.type === "undefined")
          field._item.type = default_type;
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
