"use strict";

const StorageWriter = require('../junction/writer');
const Types = require("../types");
const fs = require('fs');
//const path = require('path');

module.exports = class CsvWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    this.filename = this._options.filename || this._junction.filename || '';
    this.fd = null;
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
        let keys = Object.keys(construct);
        let headers = keys.join(',') + "\n";
        fs.writeSync(this.fd, headers);
      }

      // create data line
      var data = '';
      var first = true;
      for (let [name, field] of Object.entries(this._engram.encoding.fields)) {
        if (first)
          first = false;
        else
          data += ',';

        let value = construct[name];
        if (value !== null) {
          switch (field.type) {
            case "boolean":
              data += value ? "true" : "false";
              break;
            case "date":
              data += Types.formatDate(value);
              break;
            case "float":
            case "integer":
            case "keyword":
              data += value;
              break;
            case "text":
              data += '"' + value + '"';
              break;
          }
        }
      }

      // write data line
      if (data.length > 0) {
        data += "\n";
        fs.writeSync(this.fd, data);
      }

      callback();
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new Error('Error storing construct'));
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
        callback(new Error('Error storing construct'));
      }
    }

  }

  _final(callback) {

    try {
      // close connection, cleanup resources, ...
      if (this.fd !== null)
        fs.closeSync(this.fd);

      callback();
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new Error('Error _final'));
    }
  }

};
