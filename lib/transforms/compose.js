"use strict";

/**
 * Build a hierachical object from a stream of flat (row) objects.
 */

const { Transform } = require('stream');
const {StorageError} = require("../types");
const logger = require('../logger');

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

    this.options = Object.assign({}, options);
    this._composition = {};
  }

  /**
   * Composition object is available after the pipeline has finished.
   */
  getComposition() {
    return this._composition;
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(construct, encoding, callback) {

    // walk the heirarchy
    let node = this._composition;
    for (let name of this.options.path) {
      let cname = construct[name];
      if (!Object.prototype.hasOwnProperty.call(node, cname))
        node[cname] = {};
      node = node[cname];
    }

    // add the node
    for (let [name, value] of Object.entries(construct)) {
      if (!this.options.path.includes(name))
        node[name] = value;
    }


    callback();
  }

  async _flush(callback) {
    logger.debug("compose _flush");

    // push some final object(s)
    this.push(this._composition);

    callback();
  }

    async _final(callback) {
    logger.debug("compose _final");

    // push some final object(s)
    //this.push(this._composition);

    callback();
  }
};
