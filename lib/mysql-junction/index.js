/**
 * mysql/junction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const MySQLReader = require("./reader");
const MySQLWriter = require("./writer");
const encoder = require("./encoder");
const sqlEncoder = require("./encoder_sql");
const Engram = require("../engram");
const { typeOf, StorageResults, StorageError, hasOwnProperty } = require("../types");
const logger = require('../logger');

const mysql = require('mysql');
const util = require('util');

class MySQLJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'mysql|host=address;user=name;password=xyz;database=dbname;...|table|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("MySQLJunction");

    this._readerClass = MySQLReader;
    this._writerClass = MySQLWriter;

    // parse database connection string into options
    // "host=address;user=name;password=secret;database=name;..."
    // options passed in constructor take precedence
    let pairs = this.smt.locus.split(';');
    for (let i = 0; i < pairs.length; i++) {
      let kv = pairs[i].split('=');
      if (!this.options[kv[0]])
        this.options[kv[0]] = kv[1];
    }

    if (this.options.stringBreakpoints)
      Object.assign(encoder.stringBreakpoints, this.options.stringBreakpoints);
  }

  async activate() {
    this._isActive = true;
    logger.debug("MySQLJunction activate");

    try {
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

      if (this.options.bulkLoad) {
        // turn off checks for this session
        let sql = "SET autocommit=0";
        let results = await this.pool.query(sql); 
        sql = "SET unique_checks=0";
        results = await this.pool.query(sql); 
        sql = "SET foreign_key_checks=0";
        results = await this.pool.query(sql); 
        logger.verbose(results);
        }
    }
    catch (err) {
      logger.error(err);
    }

  }

  async relax() {
    this._isActive = false;
    logger.debug("MySQLJunction relax");

    try {
      if (this.options.bulkLoad) {
        // turn off checks for this session
        let sql = "COMMIT;";
        let results = await this.pool.query(sql);
        logger.verbose(results);
      }

      // release an resources
      await this.pool.end();
    }
    catch (err) {
      logger.error(err);
    }
  }

  /**
   * Return list of schema names found in the data source like files or tables.
   * smt.schema or options.schema should contain a wildcard character *.
   * Returns list of schema names found.
   * If options.forEach is defined it is called for each schema found and
   * the returned list will be empty.
   * @param {*} options list options
   */
  async list(options) {
    logger.debug('MySQLJunction list');
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let list = [];

    try {
      let rx = '^' + schema + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      // fetch encoding form storage source
      let sql = "SHOW FULL TABLES;";
      let tables = await this.pool.query(sql);
      for (let table of tables) {
        let keys = Object.keys(table);
        let name = table[keys[0]];
        if (rx.test(name))
          list.push(name);
      }
    }
    catch (err) {
      logger.error(err.statusCode, err.message);
      throw err;
    }

    return list;
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    logger.debug("MySQLJunction getEncoding");

    try {
      // fetch encoding form storage source
      let sql = "DESCRIBE " + this.smt.schema + ";";
      let columns = await this.pool.query(sql);

      for (let column of columns) {
        let field = encoder.storageField(column);
        this.engram.add(field);
      }
      
      // fetch the indexes
      sql = "SHOW INDEXES FROM " + this.smt.schema + ";";
      columns = await this.pool.query(sql);
      sqlEncoder.decodeIndexResults(this.engram, columns);

      return this.engram;
    }
    catch (err) {
      if (err.errno === 1146)  // ER_NO_SUCH_TABLE
        return 'not found';

      logger.error(err);
      throw err;
    }
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async putEncoding(encoding, overlay=false) {
    logger.debug("MySQLJunction putEncoding");

    if (overlay) {
      this.engram.encoding = encoding;
      return this.engram;
    }
    
    try {
      // check if table already exists
      let tables = await this.list();
      if (tables.length > 0) {
        return 'schema exists';
      }

      // use a temporary engram
      let engram = new Engram(this.engram.smt);
      engram.encoding = encoding;

      // create table on source
      let sql = sqlEncoder.sqlCreateTable(engram, this.options);
      logger.verbose(sql);
      let results = await this.pool.query(sql);

      // if successfull update engram
      this.engram.encoding = encoding;
      return this.engram;
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   * Dull a schema at the locus. 
   * Junction implementations will translate to delete file, DROP TABLE, delete index, etc.
   * @param {Object} options optional, options.schema name to use instead of junction's smt.schema
   */
  async dullEncoding(options) {
    logger.verbose('MySQLJunction dullEncoding');
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    
    try {
      let sql = "DROP TABLE " + schema + ";";
      let results = await this.pool.query(sql);
      return "ok";
    }
    catch (err) {
      if (err.errno === 1146)  // ER_NO_SUCH_TABLE
        return 'not found';

      logger.error(err);
      return err.message;
    }
  }

  /**
   *
   * @param {Object} construct - data object to store
   * @param {Object} pattern - optional parameters, source dependent
   */
  async store(construct, pattern) {
    logger.debug("MySQLJunction store");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");
    if (typeOf(construct) !== "object")
      throw new StorageError({ statusCode: 400 }, "Invalid parameter: construct is not an object");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let sql = sqlEncoder.sqlInsertUpdate(this.engram, construct);
      logger.debug(sql);
      let results = await this.pool.query(sql);

      // check if row was inserted
      return new StorageResults((results.affectedRows > 0) ? "ok" : "not stored", null, null, this.options.meta ? results : null);
    }
    catch (err) {
      if (err.errno === 1062) {  // ER_DUP_ENTRY
        return new StorageResults('duplicate', null, null, err);
      }

      logger.error(err);
      throw err;
    }
  }

  /**
   *
   * @param {Array} constructs - array of data objects to store
   * @param {Object} pattern - optional parameters, source dependent
   */
  async storeBulk(constructs, pattern) {
    logger.debug("MySQLJunction store");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");
    if (typeOf(constructs) !== "array")
      throw new StorageError({ statusCode: 400 }, "Invalid parameter: construct is not an object");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let sql = sqlEncoder.sqlBulkInsert(this.engram, constructs);
      logger.debug(sql);
      let results = await this.pool.query(sql);

      // check if rows were inserted
      return new StorageResults((results.affectedRows > 0) ? "ok" : "not stored", null, null, this.options.meta ? results : null);
    }
    catch (err) {
      if (err.errno === 1062) {  // ER_DUP_ENTRY
        return new StorageResults('duplicate', null, null, err);
      }

      logger.error(err);
      throw err;
    }
  }

  /**
   *
   */
  async recall(pattern) {
    logger.debug("MySQLJunction recall");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let sql = "SELECT * FROM " + this.smt.schema + sqlEncoder.sqlWhereFromKey(this.engram, pattern);
      logger.verbose(sql);
      let rows = await this.pool.query(sql);

      if (rows.length > 0)
        sqlEncoder.decodeResults(this.engram, rows[0]);

      return new StorageResults((rows.length > 0) ? "ok" : "not found", rows[0]);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   * @param {*}  pattern
   */
  async retrieve(pattern) {
    logger.debug("MySQLJunction retrieve");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let sql = sqlEncoder.sqlSelectWithPattern(this.engram, pattern);
      logger.verbose(sql);
      let rows = await this.pool.query(sql);

      for (let i = 0; i < rows.length; i++)
        sqlEncoder.decodeResults(this.engram, rows[i]);

      return new StorageResults((rows.length > 0) ? "ok" : "not found", rows);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   */
  async dull(pattern) {
    logger.debug("MySQLJunction dull");
    if (!pattern) pattern = {};

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let results = null;
      if (this.engram.keyof === 'primary' || this.engram.keyof === 'all') {
        // delete construct by ID
        let sql = "DELETE FROM " + this.smt.schema + sqlEncoder.sqlWhereFromKey(this.engram, pattern);
        logger.verbose(sql);
        results = await this.pool.query(sql);
      }
      else {
        // delete all constructs in the .schema
        let sql = "TRUNCATE " + this.smt.schema + ";";
        logger.verbose(sql);
        results = await this.pool.query(sql);
      }

      return new StorageResults((results.affectedRows > 0) ? "ok" : "not found", null, null, (this.options.meta ? results : null));
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

};

// define module exports
MySQLJunction.encoder = encoder;
MySQLJunction.sqlEncoder = sqlEncoder;
module.exports = MySQLJunction;
