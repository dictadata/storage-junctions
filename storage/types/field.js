/**
 * storage/types/Field
 */
"use strict";

const StorageError = require('./storage-error');

/**
 * dictadata Field types
 * ****************************************************************************
 *
 * Primitive types
 *   "boolean"
 *   "integer"
 *   "number"
 *   "keyword"
 *   "text" | "string"
 *   "date"
 *   "uuid"      -- string representation
 *   "binary"    -- buffer, blob, etc.
 *   "variable"  -- not used???
 *
 * Well known JSON object types
 *   "geometry" - GeoJSON geometry object
 *
 * Other types
 *   "unknown"  - not initialized
 *                Codify: field in sample data has all null values
 */

/**
 * dictadata Field properties
 * ****************************************************************************
 *
 * Required properties
 *   name = "<field name>"   // {string} field name, unique within Engram fields collection
 *   type = '<field type>';  // {string} field type
 *
 * Common datastore properties
 *   key = 0;         // {Boolean|Integer} true|false or key ordinal position, 1 based
 *   size = 0;        // {number} varies by type: allocation size, integer size, max character length, ...
 *   nullable = true; // {boolean} null values allowed
 *   default = null;  // {any} default value
 *   ordinal = 0;     // {number} ordinal position in datastore structure
 *
 * Datastore specific properties
 *   _<model>      // {object} _elasticsearch, _mysql, ...
 *
 * Display properties
 *   label = "";   // {string} display name
 *   width = "";   // {number} suggested display|edit box width (characters)
 *
 * Edit properties - currently not used
 *   editWith    // {string}  "input", "checkbox", "radio", "select", "fields" (recursive)
 *   noEdit      // {boolean} do not show in form, default false
 *   missing     // {boolean} show in form if missing value, default false
 *   disabled    // {boolean} show in from, but not changeable, default false
 *   input       // {object}  HTML <input> attributes: type, min, max
 *   checkbox    // {object}  options list
 *   radio       // {object}  options list
 *   select      // {object}  options list and attributes: multiple
 */

/**
 * Field descriptor for a property of a construct.
 */
module.exports = exports = class Field {

  /**
   * Field class
   * @param {*} definition attributes of the field.
   */
  constructor(definition) {
    if (typeof definition === 'string') {
      definition = { name: definition };
    }
    if (!definition?.name)
      throw new StorageError(400, "Invalid field definition");

    // required properties
    this.name = definition.name;
    this.type = 'unknown';  // may be overwritten during copy

    // shallow copy
    for (let [ prop, value ] of Object.entries(definition))
      if (typeof value !== "function")
        this[ prop ] = definition[ prop ];
  }

  get hasDefault() {
    return (typeof this.default !== "undefined");
  }
  get isNullable() {
    return (typeof this.nullable !== "undefined") ? this.nullable : true;
  }

  /**
   * true|false or key ordinal position, 1 based
   */
  get isKey() {
    return (this.key);
  }
  set isKey(value) {
    this.key = value ? value : 0;
  }

  /**
   * Returns a encoding trace for the field.
   */
  toString() {
    return JSON.stringify(this);
  }
};
