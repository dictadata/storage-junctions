"use strict";

const StorageJunction = require("../junction");

const MySQLReader = require("./reader");
const MySQLWriter = require("./writer");

const mysql = require('mysql');
const util = require('util');
const ynBoolean = require('yn');

module.exports = class MySQLJunction extends StorageJunction {

  /**
   *
   * @param {*} storagePath 'mysql|host=address;user=name;password=xyz;database=dbname|table|key' or an Engram object
   * @param {*} options
   */
  constructor(storagePath, options = null) {
    super(storagePath, options);
    //console.log("MySQLJunction");

    this._readerClass = MySQLReader;
    this._writerClass = MySQLWriter;

    // parse connection string into options
    this.parseLocation();

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
   * Add connection string key=values to this._options.
   * Options passed in constructor take precedence.
   * "host=address;user=name;password=secret;database=name"
   *
   * @param {*} constr
   */
  parseLocation() {
    let pairs = this._encoding.location.split(';');
    for (let i = 0; i < pairs.length; i++) {
      let kv = pairs[i].split('=');
      if (!this._options[kv[0]])
        this._options[kv[0]] = kv[1];
    }
  }

  storageType(myType) {
    let t = '';
    let s = '';

    // parse type returned by DESCRIBE <table>
    let found = false;
    for (let i = 0; i < myType.length; i++) {
      if (myType[i] === '(')
        found = true;
      else if (myType[i] === ')')
        break;
      else if (!found)
        t += myType[i];
      else
        s += myType[i];
    }
    let size = parseInt(s);

    // convert to storage type
    let sType = 'undefined';
    switch(t.toUpperCase()) {
      case 'TINYINT':
      case 'SMALLINT':
      case 'INT':
      case 'MEDIUMINT':
      case 'YEAR':
        sType = 'integer';
        break;

      case 'FLOAT':
      case 'DOUBLE':
        sType = 'float';
        break;

      case 'TIMESTAMP':
      case 'DATE':
      case 'DATETIME':
        sType = 'date';
        break;

      case 'CHAR':
      case 'VARCHAR':
      case 'TINYTEXT':
      case 'MEDIUMTEXT':
      case 'LONGTEXT':
      case 'TEXT':
      case 'DECIMAL':  // odd balls
      case 'BIGINT':
      case 'TIME':
      case 'GEOMETRY':
        sType = 'text';
        break;

      case 'ENUM':
      case 'SET':
        sType = 'keyword';
        break;

      case 'TINYBLOB':
      case 'MEDIUMBLOB':
      case 'LONGBLOB':
      case 'BLOB':
      case 'BINARY':
      case 'VARBINARY':
      case 'BIT':
        sType = 'binary';
        break;
    }

    return [sType,size];
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    try {
      // fetch encoding form storage source
      try {
        return this.pool.query('DESCRIBE ' + this._encoding.container + ';')
          .then((results, fields) => {
            for (let i = 0; i < results.length; i++) {
              let a = this.storageType(results[i].Type);

              let field = {
                name: results[i].Field,
                type: a[0],
                size: a[1],
                default: results[i].Default || null,
                isNullable: ynBoolean(results[i].Null) || false,
                isKey: ynBoolean(results[i].Key) || false,
                // add additional MySQL fields
                Extra: results[i].Extra
              };

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
