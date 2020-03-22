/**
 * mysql/junction
 */
"use strict";

const StorageJunction = require("../junction");
const MySQLReader = require("./reader");
const MySQLWriter = require("./writer");
const encoder = require("./encoder");
const sqlQuery = require("./sql_query");
const Engram = require("../engram");
const { StorageResults, StorageError } = require("../types");
const logger = require('../logger');

const mysql = require('mysql');
const util = require('util');

module.exports = exports = class MySQLJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'mysql|host=address;user=name;password=xyz;database=dbname;...|table|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options = null) {
    super(SMT, options);
    logger.debug("MySQLJunction");

    this._readerClass = MySQLReader;
    this._writerClass = MySQLWriter;

    // parse database connection string into _options
    // "host=address;user=name;password=secret;database=name;..."
    // options passed in constructor take precedence
    let pairs = this.smt.locus.split(';');
    for (let i = 0; i < pairs.length; i++) {
      let kv = pairs[i].split('=');
      if (!this.options[kv[0]])
        this.options[kv[0]] = kv[1];
    }

  }

  async activate() {
    this.isActive = true;
    logger.debug("mysqlJunction activate");

    this.pool = mysql.createPool({
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
    logger.debug("mysqlJunction relax");

    // release an resources
    await this.pool.end();
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    logger.debug("mysqlJunction getEncoding");

    try {
      // fetch encoding form storage source
      let sql = "DESCRIBE " + this.smt.schema + ";";
      let columns = await this.pool.query(sql);

      for (let i = 0; i < columns.length; i++) {
        let field = encoder.storageField(columns[i]);
        this.engram.add(field);
      }
      return this.engram;
    }
    catch (err) {
      if (err.errno === 1146)  // ER_NO_SUCH_TABLE
        return 'not found';

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
    logger.debug("mysqlJunction putEncoding");

    try {
      // check if table already exists
      let sql1 = "SHOW FULL TABLES LIKE '" + this.smt.schema + "';";
      let tables = await this.pool.query(sql1);

      if (tables.length > 0) {
        return 'schema exists';
      }

      let engram = new Engram(this.engram);
      engram.replace(encoding);

      // create table
      let sql2 = sqlQuery.sqlCreateTable(engram);
      let results = await this.pool.query(sql2);
      this.engram.replace(encoding);

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
  async store(construct, pattern=null) {
    logger.debug("mysqlJunction store");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");
    if (typeof construct !== "object")
      throw new StorageError({statusCode: 400}, "Invalid parameter: construct is not an object");

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let sql = sqlQuery.sqlInsert(this.engram, construct);
      let results = await this.pool.query(sql);

      // check if row was inserted
      return new StorageResults( (results.affectedRows > 0) ? "ok" : "not stored", null, null, this.options.meta ? results : null);
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
  async recall(pattern=null) {
    logger.debug("mysqlJunction recall");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let sql = "SELECT * FROM " + this.smt.schema + sqlQuery.sqlWhereFromKey(this.engram, pattern);
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
   * @param {*}  pattern
   */
  async retrieve(pattern=null) {
    logger.debug("mysqlJunction retrieve");

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let sql = sqlQuery.sqlSelectWithPattern(this.engram, pattern);
      let rows = await this.pool.query(sql);

      return new StorageResults((rows.length > 0) ? "retreived" : "not found", rows);
    }
    catch(err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   */
  async dull(pattern=null) {
    logger.debug("mysqlJunction dull");
    if (!pattern) pattern = {};

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let results = null;
      if (this.engram.keyof === 'list' || this.engram.keyof === 'all') {
        // delete construct by ID
        let sql = "DELETE FROM " + this.smt.schema + sqlQuery.sqlWhereFromKey(this.engram, pattern);
        results = await this.pool.query(sql);
      }
      else {
        // delete all constructs in the .schema
        let sql = "TRUNCATE " + this.smt.schema + ";";
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
