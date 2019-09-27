"use strict";

const { Transform } = require('stream');
var dot = require('dot-object');
const StorageError = require("../storage_error");

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

    this._options = options || {};
    this._logger = this._options.logger || storageJunction._logger;
  }

  _transform(construct, encoding, callback) {

    let newConstruct = this._options.template || {};

    if (this_.options.filter) {
      // do some filterin
    }

    if (this._options.transforms) {  // JSON object with 'source': 'target' properties in dot notation
      dot.transform(this._options.transforms, construct, newConstruct);
    }

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
