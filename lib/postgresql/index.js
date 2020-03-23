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

module.exports = exports = class PostgreSQLJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'postgresql|host=address;user=name;password=xyz;database=dbname;...|table|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("PostgreSQLJunction");

    this._readerClass = PostgreSQLReader;
    this._writerClass = PostgreSQLWriter;

    // parse database connection string into options
    // "host=address;user=name;password=secret;database=name;..."
    // options passed in constructor take precedence
    let pairs = this.engram.smt.locus.split(';');
    for (let i = 0; i < pairs.length; i++) {
      let kv = pairs[i].split('=');
      if (!this.options[kv[0]])
        this.options[kv[0]] = kv[1];
    }
  }

  async activate() {
    this.isActive = true;

    this.pool = postgresql.createPool({
      connectionLimit: this.options.connectionLimit || 8,
      host: this.options.host || 'localhost',
      user: this.options.user || 'root',
      password: this.options.password || '',
      database: this.options.database || '',
      charset: this.options.charset || 'utf8mb4',
      timezone: this.options.timezone || 'Z'
    });

    this.pool.query = util.promisify(this.pool.query);
    this.pool.end = util.promisify(this.pool.end);
  }

  async relax() {
    this.isActive = false;
    logger.debug("postgresqlJunction relax");

    // release an resources
    await this.pool.end();

    super.relax();
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    logger.debug("postgresqlJunction getEncoding");

    try {
      // fetch encoding form storage source
      let sql = "DESCRIBE " + this.engram.smt.schema + ";";
      let columns = await this.pool.query(sql);

      for (let i = 0; i < columns.length; i++) {
        let field = encoder.storageField(columns[i]);
        this.engram.add(field);
      }
      return this.engram;
    }
    catch (err) {
      if (err.errno === 1146)  // ER_NO_SUCH_TABLE
        return false;

      this.logger.error(err.message);
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
      let sql = "SHOW FULL TABLES LIKE '" + this.engram.smt.schema + "';";
      let tables = await this.pool.query(sql);

      if (tables.length === 0) {
        // create table
        this.engram.replace(encoding);
        let sql = encoder.sqlCreateTable(this.engram);
        await this.pool.query(sql);
      }

      return this.engram;
    }
    catch(err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern) {
    logger.debug("postgresqlJunction store");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");
    if (typeof construct !== "object")
      throw new StorageError({statusCode: 400}, "Invalid parameter: construct is not an object");

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let sql = encoder.sqlInsert(this.engram, construct);
      let results = await this.pool.query(sql);

      // check if row was inserted
      return new StorageResults( (results.affectedRows > 0) ? "ok" : "not stored", null, null, (this.options.meta ? results : null));
    }
    catch(err) {
      if (err.errno === 1062) {  // ER_DUP_ENTRY
        return new StorageResults('duplicate', null, null, err);
      }

      this.logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   */
  async recall(pattern) {
    logger.debug("postgresqlJunction recall");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let sql = "SELECT * FROM " + this.engram.smt.schema + encoder.sqlWhereFromKey(this.engram, pattern);
      let rows = await this.pool.query(sql);

      return new StorageResults( (rows.length > 0) ? "ok" : "not found", rows[0]);
    }
    catch(err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {
    logger.debug("postgresqlJunction retrieve");

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let sql = encoder.sqlSelectWithPattern(this.engram, pattern);
      let rows = await this.pool.query(sql);

      return new StorageResults((rows.length > 0) ? "ok" : "not found", rows);
    }
    catch(err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   */
  async dull(pattern) {
    logger.debug("postgresqlJunction dull");
    if (!pattern) pattern = {};

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let results = null;
      if (this.engram.keyof === 'list' || this.engram.keyof === 'all') {
        // delete construct by ID
        let sql = "DELETE FROM " + this.engram.smt.schema + encoder.sqlWhereFromKey(this.engram, pattern);
        results = await this.pool.query(sql);
      }
      else {
        // delete all constructs in the .schema
        let sql = "TRUNCATE " + this.engram.smt.schema + ";";
        results = await this.pool.query(sql);
      }

      return new StorageResults((results.affectedRows > 0) ? "ok" : "not found", null, null, (this.options.meta ? results : null));
    }
    catch (err) {
      this.logger.error(err.message);
      throw err;
    }
  }

};
