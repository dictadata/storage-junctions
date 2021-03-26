/**
 * storage/types/Engram
 *
 * An Engram is a desciptor for a storage memory locus (locus)
 * and the information needed to encode and decode constructs for storage.
 *
 * Storage Memory Trace (SMT) is a string representing a storage memory locus.
 * SMT and Engram represent the same concept and are interchangable as parameters.
 *
 * smt: 'model|locus|schema|key'
 */
"use strict";

const Field = require('./field');
const StorageError = require('./storage-error');
const { typeOf, hasOwnProperty, getCI } = require("../utils");

module.exports = exports = class Engram {

  /**
   * Engram class
   * @param {*} SMT is a SMT string or SMT object
   */
  constructor(SMT) {
    if (typeof SMT === "string") {
      let smt = SMT.split("|");
      this.smt = {
        model: smt[0] || '',
        locus: smt[1] || '',
        schema: smt[2] || '',
        key: smt[3] || ''
      };
    }
    else if (typeOf(SMT) === "object") {
      if (SMT.smt)
        this._copy(this, SMT);
      else
        this.smt = SMT;
    };

    if (!hasOwnProperty(this, "smt"))
      throw new StorageError( 400, "Invalid Parameter: SMT");

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
    return this._copy({}, this);
  }

  /**
   * Replace engram's encoding with new encoding's values.
   * Does not change the engram's smt.
   */
  set encoding(encoding) {
    let smt = this.smt;  // save smt
    this.dull();
    this._copy(this, encoding);
    this.merge(encoding);
    this.smt = smt;
  }

  /**
   * Replaces the engram's fields map.
   * @param {*} encoding is an engram object
   */
  replace(encoding) {
    this.encoding = encoding;
  }

  /**
   * Sets all properties that are objects to {} such as fields, indices, etc.
   * smt and other primitive properties added to the engram remain unchanged.
   */
  dull() {
    for (let [key, value] of Object.entries(this)) {
      if (key !== "smt" && typeOf(value) === "object") {
        this[key] = {};
      }
    }
  }

  /**
   * Performs a deep copy of objects. It does not copy functions.
   * Shallow copy of other reference types like array, Date, etc.
   * Note, recursive function.
   * @param {Engram} dst 
   * @param {Engram} src 
   */
  _copy(dst, src) {
    for (let [key, value] of Object.entries(src)) {
      if (typeOf(value) === "object") { // fields, indices, ...
        dst[key] = {};
        this._copy(dst[key], value);
      }
      else if (typeof value !== "function") {
        dst[key] = value;
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
    switch (this.smt.key[0]) {
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
      for (let [name,field] of Object.entries(this.fields)) {
        if (field.keyOrdinal)
          keys[field.keyOrdinal-1] = name;
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
      let uid = '';
      for (let kname of this.keys) {
        let value = (this.caseInsensitive) ? getCI(construct, kname) : construct[kname];
        if (value !== undefined)
          uid += value;
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
    
    let field = this.fields[kname];
    if (!field) {
      field = new Field({
        name: name,
        keyOrdinal: this.keys.findIndex((name) => name === kname) + 1
      });
    }
    return field;
  }

  /**
   * Add or replace a field in the fields map.
   * @param {Field} field the field
   */
  add(field) {
    let newField = new Field(field);
    if (!(newField && newField.name))
      throw new StorageError( 400, "Invalid field definition");

    let kname = (this.caseInsensitive) ? newField.name.toUpperCase() : field.name;

    let i = this.keys.findIndex((name) => name === kname);
    if (i >= 0) newField.keyOrdinal = i+1;
    
    this.fields[kname] = newField;
    return newField;
  }

  /**
   * Add / replace fields in the field map.  
   * @param {*} fields is an engram or fields object
   */
  merge(fields) {
    let newFields = fields.fields || fields;  // code do some more type checking
    if (typeOf(newFields) !== "object")
      throw new StorageError( 400, "invalid parameter");

    for (let [kname, field] of Object.entries(newFields)) {
      let name = field.name || kname;
      if (typeof field === "string") {
        // field value is the data type
        this.add({ "name": name, "type": field });
      }
      else {
        if (!field.name)
          field.name = name;
        this.add(field);
      }
    }
  }

};
