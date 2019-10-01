"use strict";

const StorageWriter = require('../junction/writer');
const Types = require("../types");
const StorageError = Types.StorageError;

const fs = require('fs');
//const path = require('path');

module.exports = class JsonWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    this.filename = this._options.filename || this._junction.filename || '';
    this.fd = null;
    this.first = true;
  }

  _write(construct, encoding, callback) {
    //console.log("StorageWriter _write");

    try {
      // save construct to .schema
      //this._junction.store(construct);  // not sure if this would be better

      // check if file is open
      if (this.fd === null) {
        let flags = this.append ? 'a+' : 'w+';
        this.fd = fs.openSync(this.filename, flags);

        // write header line
        let header = "[\n";
        fs.writeSync(this.fd, header);
      }

      let data = "";
      if (this.first)
        this.first = false;
      else
        data = ",\n";

      // create data line
      data += JSON.stringify(construct);

      // write data line
      if (data.length > 0) {
        //data += "\n";
        fs.writeSync(this.fd, data);
      }

      callback();
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error storing construct'));
    }

  }

  _writev(chunks, callback) {
    console.log("StorageWriter _writev");

    for (var i = 0; i < chunks.length; i++) {
      let construct = chunks[i].chunk;
      //let encoding = chunks[i].encoding;

      try {
        // save construct to .schema
        this._junction.store(construct);

        callback();
      }
      catch(err) {
        this._logger.error(err.message);
        callback(new StorageError({statusCode: 500, _error: err}, 'Error storing construct'));
      }
    }

  }

  _final(callback) {

    try {
      // write footer line
      let footer = "\n]";
      fs.writeSync(this.fd, footer);

      // close connection, cleanup resources, ...
      if (this.fd !== null)
        fs.closeSync(this.fd);

      callback();
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error _final'));
    }
  }

};
