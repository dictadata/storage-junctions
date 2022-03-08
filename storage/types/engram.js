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
const SMT = require('./smt');
const StorageError = require('./storage-error');
const { typeOf, hasOwnProperty, getCI } = require("../utils");

const dot = require('dot-object');

module.exports = exports = class Engram {

  /**
   * Engram class
   * @param {encoding|SMT} Encoding/Engram object, SMT object or SMT string
   */
  constructor(encoding) {
    let smt = {};
    if (typeOf(encoding) === "object" && hasOwnProperty(encoding, "smt")) {
      smt = new SMT(encoding.smt);
    }
    else {
      // assume the parameter is an SMT object or SMT string
      smt = new SMT(encoding);
      // convert to empty Encoding object
      encoding = { smt: smt };
    }

    // cortex encoding properties
    this.name = encoding.name || smt.schema;
    this.type = encoding.type || "engram";
    this.description = encoding.description || "";
    this.tags = encoding.tags || [];

    // SMT
    this.smt = smt;

    // fields encoding
    this.fields = [];
    this.fieldsMap = {};
    if (hasOwnProperty(encoding, "fields"))
      this.encoding = encoding;

    // other Engram properties
    //this.caseInsensitive = false;

  }

  /**
   * Returns the SMT string representation.
   */
  toString() {
    return this.smt.model + "|" + this.smt.locus + "|" + this.smt.schema + "|" + this.smt.key;
  }

  /**
   * Returns an object with Engram properties, but without any functions.
   */
  get encoding() {
    let encoding = Engram._copy({}, this);
    delete encoding.fieldsMap;
    return encoding;
  }

  /**
   * Replace fields definitions.
   * Replace indices, if defined in parameter object.
   * @param {Engram|encoding|fields} encoding is an Encoding/Engram object or Fields array/object
   */
  set encoding(encoding) {
    this.dull();
    this.merge(encoding);
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
  dull() {
    this.fields = [];
    this.fieldsMap = {};
    if (this.indices)
      this.indices = {};
  }

  /**
   * Add or replace fields.
   * @param {Engram|encoding|fields} encoding is an Encoding/Engram object Fields object
   */
  merge(encoding) {
    let newFields = encoding.fields || encoding;

    if (typeOf(newFields) === "object")
      newFields = Engram._convert(newFields);

    if (typeOf(newFields) !== "array")
      throw new StorageError(400, "invalid parameter");

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
      // get keys froms in smt.key definition
      //   |.|.|.|=name1+name2+...
      //   |.|.|.|!name1+name2+...
      keys = this.smt.key.substring(1).split('+');
    }
    else if (this.keyof === 'all') {
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
