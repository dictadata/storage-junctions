/**
 * storage/types/engram.js
 *
 * An Engram (encoding) is a storage memory trace (SMT) plus field definitions.
 * Field definitions are needed to encode and decode constructs for storage.
 *
 * SMT and Engram represent the same concept, accessing a specific datastore,
 * and can sometimes be interchangeable as parameters.  For example if the field
 * definitions are not needed to access the datastore.
 *
 * Extra information about the datastore may be be stored in Engram properties such
 * as indices and source specific field properties needed to (re)create a schema.
 */
"use strict";

const SMT = require('./smt');
const Fields = require('./fields');
const Field = require('./field');
const { objCopy, getCI, dot } = require('@dictadata/lib');

module.exports = exports = class Engram extends Fields {

  /**
   * Engram class
   * @param {SMT|encoding} encoding type object, SMT object or SMT string
   */
  constructor(encoding) {
    super(encoding);  // initialize fields later

    let smt;
    if (encoding?.smt)
      smt = new SMT(encoding.smt);
    else if (encoding instanceof SMT)
      smt = encoding;
    else
      smt = new SMT(encoding); // parameter MUST be SMT string

    if (!this.name)
      this.name = smt.schema;
    this.type = "engram";
    this.smt = smt;

    // junction options
    if (encoding?.options)
      this.options = encoding.options;

    if (encoding?.fields) {
      this.merge(encoding.fields);
    }

    this.indices;  // optional, indices will be created if part of the encoding definition
  }

  /**
   * Returns the SMT string representation.
   */
  toString() {
    return this.smt.toString();
  }

  /**
   * Returns a simple encoding object with the engram's properties
   * including fields array, entry properties and any user added properties.
   * Does not include functions or the fieldsMap property.
   */
  get encoding() {
    let encoding = objCopy({}, this);
    delete encoding.fields
    delete encoding.fieldsMap;
    // want fields to be last property
    encoding.fields = this.fields
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

    // update Fields
    this.dull();
    this.merge(encoding);

    if (encoding?.indices) {
      if (!this.indices)
        this.indices = {};
      objCopy(this.indices, encoding.indices);
    }
  }

  /**
   * Find a field object in the fields.
   * @param {string} name
   */
  find(name) {
    let fname = (this.caseInsensitive) ? name.toUpperCase() : name;

    let field = super.find(fname);

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
   * @param {field} field definition
   */
  add(field) {
    // check if field is part of primary index
    let i = this.keys.findIndex((name) => name === field.name);
    if (i >= 0)
      field.key = i + 1;

    return super.add(field)
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
      // get keys from smt.key definition
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
   * Returns an object with key field/value pairs.
   * @param {*} construct object that contains key fields
   */
  get_keys(construct) {
    let obj = {};
    for (let key of this.keys) {
      obj[ key ] = construct[ key ];
    }
    return obj;
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
   * @param {object} construct
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
      let found = false; // found at least one value
      for (let kname of this.keys) {
        if (kname && kname[ 0 ] === "'") {
          // strip quotes
          uid += kname.substring(1, kname.length - 1);
        }
        else {
          let value;
          if (this.options?.caseInsensitive)
            value = getCI(construct, kname);
          else
            value = dot.get(construct, kname);

          if (value !== undefined) {
            found = true;
            uid += value;
          }
        }
      }

      return found ? uid : null;
    }
    //return null;
  }

};
