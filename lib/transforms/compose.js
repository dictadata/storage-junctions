"use strict";

/**
 * Build a hierachical object from a stream of flat (row) objects.
 */

const { Transform } = require('stream');
const {StorageError} = require("../types");
const logger = require('../logger');

const dot = require('dot-object');

// example compose transform
/*
  transforms: {
    "compose": {
      // hierarchical order
      path: ['field1', 'field2', ...]

      // all other fields will become members of the lowest node object
    }
  };
*/

module.exports = exports = class ComposeTransform extends Transform {

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

    this.options = options;
    this._composition = {};
  }

  getObject() {
    return this._composition;
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(construct, encoding, callback) {

    let node = {};

    // form the node object
    for (let [name, value] of Object.entries(construct)) {
      if (!this.options.path.includes(name))
        node[name] = value;
    }

    // walk the heirarchy
    let level = this._composition;
    for (let name of this.options.path) {
      if (!Object.prototype.hasOwnProperty.call(level, name))
        level[name] = {};
      level = level[name];
    }

    // add the node
    level = node;

    callback();
  }

  _flush(callback) {
    logger.debug("compose _final");

    // push some final object(s)
    this.push(null, this._composition);
  }

};
