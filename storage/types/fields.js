/**
 * storage/types/fields.js
 *
 * Structures that contain field definitions.
 * Field definitions are needed to encode and decode constructs for storage.
 *
 */
"use strict";

const Field = require('./field');
const SMT = require('./smt');
const StorageError = require('./storage-error');
const { typeOf } = require('@dictadata/lib');

module.exports = exports = class Fields extends Object {

  /**
   * Fields class constructor
   *
   * @param {encoding} fields array, object, or object that contains fields property
   */
  constructor(encoding) {
    super();

    this.fields = new Array();
    this.fieldsMap = new Map();

    let isEngram = (encoding instanceof SMT) || (typeof encoding === "string") || encoding?.smt;
    if (!isEngram)
      this.merge(encoding);
    // else
    //   defer loading
  }

  /**
   * Clears internal structures
   */
  dull() {
    this.fields = new Array();
    this.fieldsMap = new Map();
  }

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
    return Array.from(this.fieldsMap.keys());
  }

  /**
   * Find a field object in the fields.
   * @param {string} name
   */
  find(name) {
    return this.fieldsMap.get(name);
  }

  /**
   * Add or replace a field in fields.
   * @param {field} field definition
   */
  add(field) {
    let newField = new Field(field);
    if (!newField?.name)
      throw new StorageError(400, "Invalid field definition");

    // save in array
    let p = this.fields.findIndex((fld) => fld.name === newField.name);
    if (p >= 0)
      this.fields[ p ] = newField;
    else
      this.fields.push(newField);

    // save in map
    this.fieldsMap.set(newField.name, newField);

    return newField;
  }

  /**
   * Add or replace fields.
   * @param {encoding} fields array, object, or object that contains fields property
   */
  merge(encoding) {
    let fields = encoding?.fields || encoding;

    if (typeOf(fields) === "object")
      fields = Fields.Convert(fields);

    if (typeOf(fields) !== "array")
      throw new StorageError(400, "Invalid parameter: encoding");

    for (let field of fields)
      this.add(field);
  }

  /**
   * Convert fields map|object to an array of fields.
   * @param {*} fields are fields as an object or Map wherein each field is a named property
   * @returns fields as an array of field definitions
   */
  static Convert(fields) {
    if (Array.isArray(fields))
      return fields;

    let aFields = [];

    let entries = typeOf(fields) === 'map' ? fields.entries() : Object.entries(fields);
    for (let [ name, field ] of entries) {
      if (typeof field === "string") {
        // convert to object
        field = {
          "name": name,
          "type": field
        };
      }

      if (!field.name)
        field.name = name;

      if ((field.type === "list" || field.type === "map") && typeOf(field.fields) === "object")
        field.fields = Fields.Convert(field.fields);

      aFields.push(field);
    }

    return aFields;
  }
};
