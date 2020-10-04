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
   */
  constructor(options) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 128
    };
    super(streamOptions);

    this.options = options || {};

    // engram for storing encoding
    this.engram = new Engram('any|*|*|*');

    if (typeof this.options.encoding === 'object') {
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
   * Updates encodings in this.engram.fields.
   *
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(construct, encoding, callback) {
    logger.debug("codify _transform");

    try {
      // loop through construct fields
      this.processFields("", this.engram.fields, construct);

      //if (this.options.forEach)
      //  this.options.forEach(construct, this.engram, this.options);

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

    callback(null, this.engram.fields);
  }

  /**
   * check construct against current encoding
   * recursive function
   * @param {*} fields
   * @param {*} construct
   */
  processFields(parent, fields, construct, dt = null) {
    logger.debug("processFields");

    // loop through the construct
    for (let [name, value] of Object.entries(construct)) {
      // check field name
      let fldname = name;
      if (this.options.notation === "dot" && parent)
        fldname = parent + "." + name;

      // get field definition
      if (!fields[fldname]) {
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
