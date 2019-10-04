/**
 * postgresql/junction
 */
"use strict";

const StorageJunction = require("../junction");
const PostgreSQLReader = require("./reader");
const PostgreSQLWriter = require("./writer");
const encoder = require("./encoder");
const { StorageResults, StorageError } = require("../types");
const logger = require('../logger');

const pg = require('pg');
const util = require('util');

module.exports = class PostgreSQLJunction extends StorageJunction {

  /**
   *
   * @param {*} storagePath 'postgresql|host=address;user=name;password=xyz;database=dbname;...|table|key' or an Engram object
   * @param {*} options
   */
  constructor(storagePath, options = null) {
    super(storagePath, options);
    logger.debug("PostgreSQLJunction");

    this._readerClass = PostgreSQLReader;
    this._writerClass = PostgreSQLWriter;

    // parse database connection string into _options
    // "host=address;user=name;password=secret;database=name;..."
    // options passed in constructor take precedence
    let pairs = this._engram.location.split(';');
    for (let i = 0; i < pairs.length; i++) {
      let kv = pairs[i].split('=');
      if (!this._options[kv[0]])
        this._options[kv[0]] = kv[1];
    }

    this.pool = postgresql.createPool({
      connectionLimit: this._options.connectionLimit || 8,
      host: this._options.host || 'localhost',
      user: this._options.user || 'root',
      password: this._options.password || '',
      database: this._options.database || '',
      charset: this._options.charset || 'utf8mb4',
      timezone: this._options.timezone || 'Z'
    });

    this.pool.query = util.promisify(this.pool.query);
    this.pool.end = util.promisify(this.pool.end);
  }

  async relax() {
    logger.debug("postgresqlJunction relase");

    // release an resources
    await this.pool.end();
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    logger.debug("postgresqlJunction getEncoding");

    try {
      // fetch encoding form storage source
      let sql = "DESCRIBE " + this._engram.schema + ";";
      let columns = await this.pool.query(sql);

      for (let i = 0; i < columns.length; i++) {
        let field = encoder.storageField(columns[i]);
        this._engram.add(field);
      }
      return this._engram;
    }
    catch (err) {
      if (err.errno === 1146)  // ER_NO_SUCH_TABLE
        return false;

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
    logger.debug("postgresqlJunction putEncoding");

    try {
      // check if table already exists
      let sql = "SHOW FULL TABLES LIKE '" + this._engram.schema + "';";
      let tables = await this.pool.query(sql);

      if (tables.length === 0) {
        // create table
        this._engram.replace(encoding);
        let sql = encoder.sqlCreateTable(this._engram);
        await this.pool.query(sql);
      }

      return this._engram;
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
    logger.debug("postgresqlJunction store");

    if (this._engram.keyof === 'uid' || this._engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");
    if (typeof construct !== "object")
      throw new StorageError({statusCode: 400}, "Invalid parameter: construct is not an object");

    try {
      if (Object.keys(this._engram.fields).length == 0)
        await this.getEncoding();

      let sql = encoder.sqlInsert(this._engram, construct);
      let results = await this.pool.query(sql);

      // check if row was inserted
      return new StorageResults( (results.affectedRows > 0) ? "ok" : "not stored", null, null, results);
    }
    catch(err) {
      if (err.errno === 1062) {  // ER_DUP_ENTRY
        return new StorageResults('duplicate', null, null, err);
      }

      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   */
  async recall(options = null) {
    logger.debug("postgresqlJunction recall");

    if (this._engram.keyof === 'uid' || this._engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");

    try {
      if (Object.keys(this._engram.fields).length == 0)
        await this.getEncoding();

      let sql = "SELECT * FROM " + this._engram.schema + encoder.sqlWhereFromKey(this._engram, options);
      let rows = await this.pool.query(sql);

      return new StorageResults( (rows.length > 0) ? "ok" : "not found", rows[0]);
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} options options.pattern
   */
  async retrieve(options = null) {
    logger.debug("postgresqlJunction retrieve");
    let pattern = options && (options.pattern || options);

    try {
      if (Object.keys(this._engram.fields).length == 0)
        await this.getEncoding();

      let sql = encoder.sqlSelectWithPattern(this._engram, pattern);
      let rows = await this.pool.query(sql);

      return new StorageResults((rows.length > 0) ? "ok" : "not found", rows);
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
    logger.debug("postgresqlJunction dull");
    if (!options) options = {};

    if (this._engram.keyof === 'uid' || this._engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");

    try {
      if (Object.keys(this._engram.fields).length == 0)
        await this.getEncoding();

      let results = null;
      if (this._engram.keyof === 'list' || this._engram.keyof === 'all') {
        // delete construct by ID
        let sql = "DELETE FROM " + this._engram.schema + encoder.sqlWhereFromKey(this._engram, options);
        results = await this.pool.query(sql);
      }
      else {
        // delete all constructs in the .schema
        let sql = "TRUNCATE " + this._engram.schema + ";";
        results = await this.pool.query(sql);
      }

      return new StorageResults((results.affectedRows > 0) ? "ok" : "not found", null, null, results);
    }
    catch (err) {
      this._logger.error(err.message);
      throw err;
    }
  }

};