"use strict";

const { Transform } = require('stream');
var dot = require('dot-object');

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
    if (!this._junction.hasOwnProperty("_encoding"))
      throw new Error("Invalid parameter: storageJunction");

    this._options = options || {};
    this._logger = this._options.logger || storageJunction._logger;

    this.template = this._options.template || {};
    this.transforms = this._options.transforms || {};  // JSON object with 'source': 'target' properties in dot notation
  }

  _transform(construct, encoding, callback) {

    let newConstruct = this.template;

    dot.transform(this.transforms, construct, newConstruct);

    this.push(newConstruct);
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
