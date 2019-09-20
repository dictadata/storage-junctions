"use strict";

const StorageReader = require('../junction/reader');

const mysql = require('mysql');
const util = require('util');

module.exports = class MySQLReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    // update engram
    //this._encoding.location = ;
    //this._encoding.container = ;
    this._encoding.key = '*';
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  _read(size) {

    // read up to size constructs
    try {
      this._junction.pool.query('SELECT * FROM ' + this._encoding.container + ';')
        .then((results, fields) => {
          for (let i = 0; i < results.length; i++)
            this.push(results[i]);

          // when done reading from source
          this.push(null);
        });
    }
    catch (err) {
      this._logger.error(err.message);
      this.push(null);
    }

  }

};
