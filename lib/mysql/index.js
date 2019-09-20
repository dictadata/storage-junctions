/**
 * mysql/junction
 */
"use strict";

const StorageJunction = require("../junction");
const MySQLReader = require("./reader");
const MySQLWriter = require("./writer");
const encoder = require("./encoder");

const mysql = require('mysql');
const util = require('util');

module.exports = class MySQLJunction extends StorageJunction {

  /**
   *
   * @param {*} storagePath 'mysql|host=address;user=name;password=xyz;database=dbname;...|table|key' or an Engram object
   * @param {*} options
   */
  constructor(storagePath, options = null) {
    super(storagePath, options);
    //console.log("MySQLJunction");

    this._readerClass = MySQLReader;
    this._writerClass = MySQLWriter;

    // parse database connection string into _options
    // "host=address;user=name;password=secret;database=name;..."
    // options passed in constructor take precedence
    let pairs = this._encoding.location.split(';');
    for (let i = 0; i < pairs.length; i++) {
      let kv = pairs[i].split('=');
      if (!this._options[kv[0]])
        this._options[kv[0]] = kv[1];
    }

    this.pool = mysql.createPool({
      connectionLimit: this._options.connectionLimit || 8,
      host: this._options.host || 'localhost',
      user: this._options.user || 'root',
      password: this._options.password || '',
      database: this._options.database || '',
      charset: this._options.charset || 'utf8mb4',
      timezone: this._options.timezone || 'Z'
    });

    this.pool.query = util.promisify(this.pool.query);
  }


  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    try {
      // fetch encoding form storage source
      return this.pool.query("DESCRIBE " + this._encoding.container + ";")
        .then(columns => {
          for (let i = 0; i < columns.length; i++) {
            let field = encoder.storageField(columns[i]);
            this._encoding.add(field);
          }

          return this._encoding;
        });
    }
    catch (err) {
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
      this._encoding.merge(encoding);

      // check if table already exists
      return this.pool.query("SHOW FULL TABLES LIKE '" + this._encoding.container + "';")
      .then(tables => {
        if (tables.length === 0)
          // create table
          return this.pool.query(encoder.createTable(this._encoding));
        else {
          return this._encoding;
        }
      })
      .then(results => {
        // was table created
        return this._encoding;
      });
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
      return this.pool.query(encoder.createInsert(this._encoding, construct))
      .then(results => {
        // row was inserted
        return true;
      });
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
      return this.pool.query('SELECT 1 + 1 AS solution')
      .then( (results, fields) => {
        console.log('The solution is: ', results[0].solution);
        return results[0];
      });
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
