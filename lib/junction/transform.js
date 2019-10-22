"use strict";

const { Transform } = require('stream');
const {StorageError} = require("../types");
const dot = require('dot-object');

/*
  example transforms options
  var transforms = {

    // add new fields to the construct
    inject: {
      "new field": "My New Object"
    },
    inject_before: true,
    //inject_after: true,  // default

    // forward constructs that match these expressions
    match: {
      "field1": {
        op: 'eq',
        value: 'abc'
      }
    },

    // drop constructs that match these expressions
    drop: {
      "field2": {
        op: 'lte',
        value: '2.5'
      }
    },

    // select and map fields, {src: dest, ...}
    // uses Dot-Object library
    mapping: {
      "field1": "field1",
      "object1.fieldx":  "fieldsx"
    }
  };
*/

module.exports = class StorageTransform extends Transform {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 64
    };
    super(streamOptions);

    this._junction = storageJunction;
    if (!this._junction.hasOwnProperty("_engram"))
      throw new StorageError({statusCode: 400}, "Invalid parameter: storageJunction");

    this.options = options || {};
    this.logger = this.options.logger || storageJunction._logger;

    if ( !(this.options.inject_before && this.options.inject_after) )
      this.options.inject_after = true;
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(construct, encoding, callback) {

    let forward = true;

    if (this.options.match) {
      // do some filterin
      for (let [name, exp] of Object.entries(this.options.match)) {
        switch (exp.op) {
          case 'eq':
            forward = forward && construct[name] && (construct[name] === exp.value);
            break;
          case 'neq':
            forward = forward && construct[name] && (construct[name] !== exp.value);
            break;
          case 'lt':
            forward = forward && construct[name] && (construct[name] < exp.value);
            break;
          case 'lte':
            forward = forward && construct[name] && (construct[name] <= exp.value);
            break;
          case 'gt':
            forward = forward && construct[name] && (construct[name] > exp.value);
            break;
          case 'gte':
            forward = forward && construct[name] && (construct[name] >= exp.value);
            break;
          case 'exists':
            forward = forward && construct[name];
            break;
          default:
            break;
        }

        if (!forward)
          break;
      }
    }

    if (forward && this.options.drop) {
      // do some filterin
      for (let [name, exp] of Object.entries(this.options.drop)) {
        switch (exp.op) {
          case 'eq':
            forward = forward && construct[name] && !(construct[name] === exp.value);
            break;
          case 'neq':
            forward = forward && construct[name] && !(construct[name] !== exp.value);
            break;
          case 'lt':
            forward = forward && construct[name] && !(construct[name] < exp.value);
            break;
          case 'lte':
            forward = forward && construct[name] && !(construct[name] <= exp.value);
            break;
          case 'gt':
            forward = forward && construct[name] && !(construct[name] > exp.value);
            break;
          case 'gte':
            forward = forward && construct[name] && !(construct[name] >= exp.value);
            break;
          case 'exists':
            forward = forward && !construct[name];
            break;
          default:
            break;
        }

        if (!forward)
          break;
      }
    }

    if (forward) {
      let newConstruct = {};

      if (this.options.inject_before)
        Object.assign(newConstruct, this.options.inject);

      if (this.options.mapping)   // JSON object with 'source': 'target' properties in dot notation
        dot.transform(this.options.mapping, construct, newConstruct);
      else
        Object.assign(newConstruct, construct);

      if (this.options.inject_after)
        Object.assign(newConstruct, this.options.inject);

      this.push(newConstruct);
    }

    callback();
  }

  /* optional */
  /*
  _flush(callback) {

    // push some final object(s)
    this.push({results: 'x'})
  }
  */

};
