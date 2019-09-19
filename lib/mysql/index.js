"use strict";

const StorageJunction = require("../junction");

const MySQLReader = require("./reader");
const MySQLWriter = require("./writer");

const mysql = require('mysql');
const util = require('util');

module.exports = class MySQLJunction extends StorageJunction {

  /**
   *
   * @param {*} storagePath 'mysql|host:port|database.table|key' or an Engram object
   * @param {*} options
   */
  constructor(storagePath, options = null) {
    super(storagePath, options);
    //console.log("MySQLJunction");

    this._readerClass = MySQLReader;
    this._writerClass = MySQLWriter;

    this.connection = mysql.createConnection({
      host     : this._encoding.location || 'localhost',
      user     : this._options.user || 'root',
      password : this._options.password || '',
      database : this._options.database || ''
    });
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    try {
      // fetch encoding form storage source

      this.connection.connect();

      this.connection.end();

      return this._encoding;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async putEncoding(encoding) {
    try {
      Object.assign(this._encoding, encoding);

      /*

      */
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, options = null) {
    if (typeof construct !== "object")
      throw new Error("Invalid parameter: construct is not an object");

    try {
      let results = {};
      return results;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   */
  async recall(options = null) {
    if (!this._encoding.key) {
      throw "no storage key specified";
    }

    try {
      let results = {};
      let query = util.promisify(this.connection.query);

      query('SELECT 1 + 1 AS solution')
      .then( (error, results, fields) => {
        if (error) throw error;
        console.log('The solution is: ', results[0].solution);
      })
      .catch(error => {
        //
      }

      return results;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   */
  async dull(options = null) {
    try {
      let results = {};
      if (this._encoding.key)
        results = {};  // delete construct by ID
      else
        results = {};  // delete all constructs in the container
      return results;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern, options = null) {
    if (typeof pattern !== "object")
      throw new Error("Invalid parameter: pattern is not an object");

    try {
      let constructs = [];
      return constructs;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

};
