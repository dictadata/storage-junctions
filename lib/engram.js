/**
 * storage/engram
 *
 * An Engram is a desciptor for a storage memory locus (locus)
 * and the information needed to encode and decode constructs for storage.
 *
 * Storage Memory Trace (SMT) is a string representing a storage memory locus.
 * SMT and Engram represent the same concept and are interchangable.
 *
 * smt: 'model|locus|schema|key'
 */
"use strict";

const Field = require('./field');
const { typeOf, StorageError } = require("./types");
const getCI = require("./utils/getCI");

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

      // field encodings
      this.fields = {};
    }
    else if (typeOf(SMT) === "object") {
      this.smt = SMT.smt || SMT;

      // field encodings
      if (SMT.fields)
        this.replace(SMT.fields);
      else
        this.fields = {};
    }
    else {
      throw new StorageError({ statusCode: 400 }, "Invalid Parameter: SMT");
    }

    if (process.env.NODE_ENV === 'development')
      this._SMT = SMT;
    
    this.options = {};
    //this.options.caseInsensitive = false;
  }

  /**
   * at least one field encoding defined
   * denotes that encodings have been loaded from or saved to storage source
   */
  get isDefined() {
    return Object.keys(this.fields).length > 0;
  }

  get fieldsLength() {
    return Object.keys(this.fields).length;
  }

  toString() {
    return this.smt.model + "|" + this.smt.locus + "|" + this.smt.schema + "|" + this.smt.key;
  }

  get names() {
    return Object.keys(this.fields);
  }

  get encoding() {
    let enc = {};
    Object.assign(enc.smt, this.smt);
    Object.assign(enc.fields, this.fields);
    // options
    // indexes
    // constraints

    return enc;
  }

  // ----- keys -----

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
   * Returns smt key names or primary field names
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

  // ----- unique identifiers -----

  get uid() {
    if (this.keyof === 'uid') {
      return this.smt.key;
    }

    return null;
  }

  /**
   * Creates a unique ID value by concatenating key or primary field values.
   * @param {*} construct 
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
        let value = (this.options.caseInsensitive) ? getCI(construct, kname) : construct[kname];
        if (value !== undefined)
          uid += value;
      }
      return uid ? uid : null;
    }
    //return null;
  }

  // ----- field encodings -----

  find(name) {
    let kname = (this.options.caseInsensitive) ? name.toUpperCase() : name;
    
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
   *
   * @param {*} field
   * @param {*} check
   */
  add(field) {
    let newField = new Field(field);
    if (!(newField && newField.name))
      throw new StorageError({ statusCode: 400 }, "Invalid field definition");

    let kname = (this.options.caseInsensitive) ? newField.name.toUpperCase() : field.name;

    let i = this.keys.findIndex((name) => name === kname);
    if (i >= 0) newField.keyOrdinal = i+1;
    
    this.fields[kname] = newField;
    return newField;
  }

  /**
   * Removes all field encodings
   */
  dull() {
    this.fields = {};
  }

  /**
   *
   * @param {*} encoding is an engram or fields object
   */
  replace(encoding) {
    this.dull();
    this.merge(encoding);
  }

  /**
   *
   * @param {*} encoding is an engram or fields object
   */
  merge(encoding) {
    let newFields = encoding.fields || encoding;  // code do some more type checking
    if (typeOf(newFields) !== 'object')
      throw new Error('invalid parameter');

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

