/**
 * storage/types/Engram
 *
 * An Engram is an encoding for a storage memory trace
 * and the field information needed to encode and decode constructs for storage.
 *
 * SMT and Engram represent the same concept and are interchangable as parameters.
 *
 * Storage Memory Trace (SMT) is a string representing a storage memory locus.
 *   smt: 'model|locus|schema|key'
 */
"use strict";

const Field = require('./field');
const parseSMT = require('./parseSMT');
const StorageError = require('./storage-error');
const { typeOf, hasOwnProperty, getCI } = require("../utils");

const dot = require('dot-object');

module.exports = exports = class Engram {

  /**
   * Engram class
   * @param {*} SMT is a SMT string or SMT object
   */
  constructor(SMT) {
    let smt = parseSMT(SMT);

    // codex fields
    this.name = smt.schema;
    this.type = "engram";
    this.description = "";
    this.tags = [];

    // SMT
    this.smt = smt;

    // fields encoding
    if (!hasOwnProperty(this, "fields"))
      this.fields = {};

    if (process.env.NODE_ENV === 'development')
      this._SMT = SMT;

    // Other properties related to the engram's storage source can be added as needed.
    //this.caseInsensitive = false;

  }

  /**
   * Returns the SMT string representation.
   */
  toString() {
    return this.smt.model + "|" + this.smt.locus + "|" + this.smt.schema + "|" + this.smt.key;
  }

  /**
   * Returns an object with engram properties, but without any functions.
   */
  get encoding() {
    return Engram._copy({}, this);
  }

  /**
   * Replace fields definitions.
   * @param {Engram|encoding|fields} encoding is an engram, encoding or fields object
   */
  set encoding(encoding) {
    this.dull();
    this.merge(encoding);
  }

  /**
   * Replaces the engram's fields map.
   * DEPRECATED Use the encoding setter method.
   * @param {Engram|encoding|fields} encoding is an engram, encoding or fields object
   */
  replace(encoding) {
    this.encoding = encoding;
  }

  /**
   * Copy all src members to dst object.
   * Deep copy of object members.
   * Shallow copy of reference types like array, Date, etc.
   * Does not copy functions.
   * Note, recursive function.
   * @param {Engram} dst
   * @param {Engram} src
   */
  static _copy(dst, src) {
    for (let [ key, value ] of Object.entries(src)) {
      if (typeOf(value) === "object") { // fields, ...
        dst[ key ] = {};
        Engram._copy(dst[ key ], value);
      }
      else if (typeof value !== "function") {
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
    return Object.keys(this.fields).length > 0;
  }

  /**
   * Number of fields in the fields map.
   */
  get fieldsLength() {
    return Object.keys(this.fields).length;
  }

  /**
   * Array of field names.
   */
  get names() {
    return Object.keys(this.fields);
  }

  /**
   * The type of key specified in smt.key that determines how to access the storage source.
   */
  get keyof() {
    if (!this.smt.key)
      return 'none';
    switch (this.smt.key[ 0 ]) {
      case '*':
        return 'all';   // primary keys specified in field encodings, or no recall
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
      // get keys from smt key
      //   |.|.|.|=name1+name2+...
      //   |.|.|.|!name1+name2+...
      keys = this.smt.key.substring(1).split('+');
    }
    else if (this.keyof === 'all') {
      // look for key fields in the encoding
      for (let [ name, field ] of Object.entries(this.fields)) {
        if (field.key)
          keys[ field.key - 1 ] = name;
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
   * Find a field object in the fields map.
   * @param {String} name
   */
  find(name) {
    let kname = (this.caseInsensitive) ? name.toUpperCase() : name;

    let field = this.fields[ kname ];
    if (!field) {
      field = new Field({
        name: name,
      });
      let key = this.keys.findIndex((name) => name === kname) + 1;
      if (key)
        field.key = key;
    }
    return field;
  }

  /**
   * Add or replace a field in the fields map.
   * @param {Field} field the field definition
   */
  add(field) {
    let newField = new Field(field);
    if (!(newField && newField.name))
      throw new StorageError(400, "Invalid field definition");

    let kname = (this.caseInsensitive) ? newField.name.toUpperCase() : field.name;

    let i = this.keys.findIndex((name) => name === kname);
    if (i >= 0) newField.key = i + 1;

    this.fields[ kname ] = newField;
    return newField;
  }

  /**
   * Add / replace fields in the field map.
   * @param {Engram|encoding|fields} encoding is an engram, encoding or fields object
   */
  merge(encoding) {
    let fields = encoding.fields || encoding;  // could do some more type checking
    if (typeOf(fields) !== "object")
      throw new StorageError(400, "invalid parameter");

    for (let [ kname, field ] of Object.entries(fields)) {
      let name = field.name || kname;
      if (typeof field === "string") {
        // field value is the data type
        this.add({ "name": name, "type": field });
      }
      else {
        // complex data type or unknown data type (???)
        if (!field.name)
          field.name = name;
        this.add(field);
      }
    }
  }

  /**
   * Sets all properties that are objects to {} such as fields.
   * smt and other primitive properties added to the engram remain unchanged.
   */
  dull() {
    for (let [ key, value ] of Object.entries(this)) {
      if (key !== "smt" && typeOf(value) === "object") {
        this[ key ] = {};
      }
    }
  }

};
