"use strict";

const { Transform } = require('stream');
const { StorageError } = require("../types");
const logger = require('../logger');

const dot = require('dot-object');

/*
  // example consolidate transform
  transform: {
    consolidate: {

    }
  };
*/

module.exports = exports = class ConsolidateTransform extends Transform {

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
    this.logger = options.logger || logger;

    this.summary = {};
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(construct, encoding, callback) {

    // add stuff to this.summary

    // convert any consolidate ranges to arrays
/*
    if (store.consolidate) {
      for (let [name, value] of Object.entries(store.consolidate)) {
        if (!Array.isArray(value)) {
          let min = value.min || 1;
          let max = value.max || 0;
          let inc = value.inc || 1;
          let steps = [];
          for (let i = min; i <= max; i += inc)
            steps.push(i);
          store.consolidate[name] = steps;
        }
      }
    }
*/

    for (let [name, formula] of Object.entries(this.options)) {
      // do calculations

    }

    callback();
  }

  /* optional */
  _flush(callback) {
    let newConstruct = {};

    // make any calculations on totals

    // pack this.summary into new construct

    // push the final object(s)
    this.push(newConstruct);
    callback();
  }

};