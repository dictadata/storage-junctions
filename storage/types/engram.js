/**
 * storage/types/engram.js
 *
 * An Engram (encoding) is a storage memory trace (SMT) plus field definitions.
 * Field definitions are needed to encode and decode constructs for storage.
 *
 * SMT and Engram represent the same concept, accessing a specific datasource,
 * and can sometimes be interchangable as parameters.  For example if the field
 * definitions are not needed to access the datasource.
 *
 * Extra information about the datasource may be be stored in Engram properties such
 * as indices and source specific field properties needed to (re)create a schema.
 */
"use strict";

const SMT = require('./smt');
const Field = require('./field');
const Entry = require('./entry');
const StorageError = require('./storage-error');
const { typeOf, hasOwnProperty, getCI } = require("../utils");

const dot = require('dot-object');

module.exports = exports = class Engram extends Entry {

  /**
   * Engram class
   * @param {SMT|encoding} encoding type object, SMT object or SMT string
   */
  constructor(encoding) {
    super(encoding);
    this.type = "engram";

    let smt = {};
    if (typeOf(encoding) === "object" && hasOwnProperty(encoding, "smt")) {
      smt = new SMT(encoding.smt);
    }
    else {
      // assume the parameter is an SMT object or SMT string
      smt = new SMT(encoding);
      // convert to encoding object with no field definitions
      encoding = { smt: smt };
    }

    if (!this.name)
      this.name = smt.schema;
    this.smt = smt;

    // junction options
    if (encoding.options) this.options = encoding.options;

    // field definitions
    this.fields = [];
    this.fieldsMap = {};
    if (hasOwnProperty(encoding, "fields"))
      this.encoding = encoding.fields;
  }

  /**
   * Returns the SMT string representation.
   */
  toString() {
    return this.smt.model + "|" + this.smt.locus + "|" + this.smt.schema + "|" + this.smt.key;
  }

  /**
   * Returns a simple encoding object with the engram's properties
   * including fields array, codex properties and any user added properties.
   * Does not include functions or the fieldsMap property.
   */
  get encoding() {
    let encoding = Engram._copy({}, this);
    delete encoding.fieldsMap;
    return encoding;
  }

  /**
   * Replace fields definitions only.
   * Replaces indices definitions, if defined in encoding.indices parameter.
   * @param {encoding|Engram|fields} encoding is an Encoding/Engram object or Fields array/object
   */
  set encoding(encoding) {
    // check to update smt.key
    // if defined and more specific, takes precedence over current smt.key
    if (encoding.smt && (!this.smt.key || this.smt.key === '*' || this.smt.key === '!')) {
      let smt = (typeof encoding.smt === "string") ? new SMT(encoding.smt) : encoding.smt;
      if (smt.key) {
        this.smt.key = smt.key;
      }
    }

    this.dullfields();
    this.mergefields(encoding);
    /*
        if (encoding && encoding.smt) {
          let smt = new SMT(encoding.smt);
          this.smt.key = smt.key;
        }
    */
    if (encoding && encoding.indices) {
      this.indices = {};
      Engram._copy(this.indices, encoding.indices);
    }
  }

  /**
   * Replaces the engram's fields.
   * DEPRECATED Use the encoding setter method.
   * @param {Engram|encoding|fields} encoding is an engram, encoding or fields object
   */
  replace(encoding) {
    this.encoding = encoding;
  }

  /**
   * Sets fields and indices to empty
   * smt and other primitive properties added to the engram remain unchanged.
   */
  dullfields() {
    this.fields = [];
    this.fieldsMap = {};
    if (this.indices)
      this.indices = {};
  }

  /**
   * Add or replace fields.
   * @param {Engram|encoding|fields} encoding is an Encoding/Engram object Fields object
   */
  mergefields(encoding) {
    let newFields = encoding.fields || encoding;

    if (typeOf(newFields) === "object")
      newFields = Engram._convert(newFields);

    if (typeOf(newFields) !== "array")
      throw new StorageError(400, "Invalid parameter: encoding");

    for (let field of newFields)
      this.add(field);
  }

  /**
   * Copy/replace src properties in dst object.
   * Deep copy of object properties and top level arrays.
   * Shallow copy of reference types like Date, sub-arrays, etc.
   * Objects and arrays will be replaced not merged!
   * Does not copy functions.
   * Note, this is a recursive function.
   * @param {Engram} dst
   * @param {Engram} src
   */
  static _copy(dst, src) {
    for (let [ key, value ] of Object.entries(src)) {
      if (typeOf(value) === "object") { // fields, ...
        dst[ key ] = {};  // replace
        Engram._copy(dst[ key ], value);
      }
      else if (typeOf(value) === "array") {
        dst[ key ] = [];  // replace
        for (let item of value)
          if (typeOf(item) === "object")
            dst[ key ].push(Engram._copy({}, item));
          else
            dst[ key ].push(item);
      }
      else if (typeOf(value) !== "function") {
        dst[ key ] = value;
      }
    }
    return dst;
  }

  // ----- field related properties -----

  /**
   * True if at least one field encoding is defined.
   */
  get isDefined() {
    return this.fields.length > 0;
  }

  /**
   * Number of fields in the fields map.
   */
  get fieldsLength() {
    return this.fields.length;
  }

  /**
   * Array of field names.
   */
  get names() {
    return Object.keys(this.fieldsMap);
  }

  /**
   * The type of key specified in smt.key that determines how to access the storage source.
   */
  get keyof() {
    if (!this.smt.key)
      return 'none';
    switch (this.smt.key[ 0 ]) {
      case '*':
        return '*';   // primary keys specified in field encodings, or no recall
      case '=':
        return 'primary';  // field list for lookup, e.g. database records
      case '!':
        return 'key';   // app provided key; optional field list to calculate key
      default:
        return 'uid';   // an individual uid, to use as default
    }
  }

  /**
   * Returns an array of smt.key names or primary field names.
   */
  get keys() {
    let keys = [];

    if (this.keyof === 'primary' || this.keyof === 'key') {
      // get keys froms in smt.key definition
      //   |.|.|.|=name1+name2+...
      //   |.|.|.|!name1+name2+...
      keys = this.smt.key.substring(1).split('+');
    }
    else if (this.keyof === '*') {
      // look for key fields in the encoding
      for (let field of this.fields) {
        if (field.key)
          keys[ field.key - 1 ] = field.name;
      }
    }

    return keys;
  }

  /**
   * Get UID value if the smt points to an individual piece of data, i.e. smt.key value.
   */
  get uid() {
    if (this.keyof === 'uid') {
      return this.smt.key;
    }

    return null;
  }

  /**
   * Creates a unique ID value by concatenating key or primary field values.
   * @param {Object} construct
   */
  get_uid(construct) {
    if (this.keyof === 'uid') {
      // the SMT addresses a unique piece of data
      return this.smt.key;
    }
    else {
      if (!construct)
        return null;

      // generate uid from !keys or =primary keys
      // in the form "!dot.fieldname+'literal'+..."
      let uid = '';
      for (let kname of this.keys) {
        if (kname && kname[ 0 ] === "'") {
          // strip quotes
          uid += kname.substr(1, kname.length - 2);
        }
        else {
          let value;
          if (this.caseInsensitive)
            value = getCI(construct, kname);
          else
            value = dot.pick(kname, construct);

          if (value !== undefined)
            uid += value;
        }
      }

      return uid ? uid : null;
    }
    //return null;
  }

  /**
   * Find a field object in the fields.
   * @param {String} name
   */
  find(name) {
    let fname = (this.caseInsensitive) ? name.toUpperCase() : name;

    let field = this.fieldsMap[ fname ];
    if (!field) {
      field = new Field({
        name: name,
      });
      let key = this.keys.findIndex((name) => name === fname) + 1;
      if (key)
        field.key = key;
    }
    return field;
  }

  /**
   * Add or replace a field in fields.
   * @param {field} field is the Field definition
   */
  add(field) {
    let newField = new Field(field);
    if (!(newField && newField.name))
      throw new StorageError(400, "Invalid field definition");

    let fname = (this.caseInsensitive) ? newField.name.toUpperCase() : field.name;

    // check if field is part of primary index
    let i = this.keys.findIndex((name) => name === fname);
    if (i >= 0) newField.key = i + 1;

    // save in array
    let p = this.fields.findIndex((fld) => fld.name === fname);
    if (p >= 0)
      this.fields[ p ] = newField;
    else
      this.fields.push(newField);

    // save in map
    this.fieldsMap[ fname ] = newField;

    return newField;
  }

  /**
   * Convert fields map to an array of fields.
   * @param {*} fieldsMap are fields as an object (map) wherein each field is a named property
   * @returns fields as an array of Field objects
   */
  static _convert(fieldsMap) {
    let fields = [];

    for (let [ name, field ] of Object.entries(fieldsMap)) {
      if (typeOf(field) === "string") {
        // convert to object
        field = {
          "name": name,
          "type": field
        };
      }

      if (!field.name)
        field.name = name;

      if ((field.type === "list" || field.type === "map") && typeOf(field.fields) === "object")
        field.fields = Engram._convert(field.fields);

      fields.push(field);
    }

    return fields;
  }
};
