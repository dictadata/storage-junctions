/**
 * mysql/junction
 */
"use strict";

const StorageJunction = require('../storage-junction');
const { Engram, StorageResults, StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');
const { typeOf } = require('@dictadata/lib');

const MySQLReader = require('./mysql-reader');
const MySQLWriter = require('./mysql-writer');
const encoder = require('./mysql-encoder');
const sqlEncoder = require('./mysql-encoder-sql');

const mysql = require('mysql2');
const util = require('util');

class MySQLJunction extends StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    filesystem: false, // storage source is filesystem
    sql: true,         // storage source is SQL
    keystore: false,   // supports key-value storage

    encoding: true,    // get encoding from source
    reader: true,     // stream reader
    writer: true,     // stream writer
    store: true,       // store/recall individual constructs
    query: true,       // select/filter data at source
    aggregate: true    // aggregate data at source
  }

  // assign stream constructor functions, sub-class must override
  _readerClass = MySQLReader;
  _writerClass = MySQLWriter;

  /**
   *
   * @param {*} smt 'mysql|host=address;user=name;password=xyz;database=dbname;...|table|key' or an Engram object
   * @param {*} options
   */
  constructor(smt, options) {
    super(smt, options);
    logger.debug("MySQLJunction");

    if (this.options.stringBreakpoints)
      Object.assign(encoder.stringBreakpoints, this.options.stringBreakpoints);
  }

  async activate() {
    this.isActive = true;
    logger.debug("MySQLJunction activate");

    try {
      let config = sqlEncoder.connectionConfig(this.smt, this.options);
      this.pool = mysql.createPool(config);

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
        //logger.debug(JSON.stringify(results));
      }
    }
    catch (err) {
      logger.warn("MySQLJunction: " + (err.code || err.message));
    }

  }

  async relax() {
    this.isActive = false;
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
      logger.warn("MySQLJunction: " + (err.code || err.message));
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

    try {
      options = Object.assign({}, this.options, options);
      let schema = options?.schema || this.smt.schema;
      let list = [];

      let rx = '^' + schema + '$';
      rx = rx.replace(/\./g, '\\.');
      rx = rx.replace(/\?/g, '.');
      rx = rx.replace(/\*/g, '.*');
      rx = new RegExp(rx);

      // fetch encoding form storage source
      let sql = "SHOW FULL TABLES;";
      let tables = await this.pool.query(sql);
      for (let table of tables) {
        let keys = Object.keys(table);
        let name = table[ keys[ 0 ] ];
        if (rx.test(name))
          list.push(name);
      }

      return new StorageResults(0, null, list);
    }
    catch (err) {
      logger.warn("MySQLJunction: " + (err.code || err.message));
      throw this.StorageError(err);
    }
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEngram() {
    logger.debug("MySQLJunction get encoding");

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

      return new StorageResults("engram", null, this.engram.encoding);
    }
    catch (err) {
      if (err.errno === 1146)  // ER_NO_SUCH_TABLE
        return new StorageResults(404, 'no such table');

      logger.warn("MySQLJunction: " + (err.code || err.message));
      throw this.StorageError(err);
    }
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async createSchema(options = {}) {
    logger.debug("MySQLJunction createSchema");

    try {
      let encoding = options.encoding || this.engram.encoding;

      // check if table already exists
      let { data: tables } = await this.list();
      if (tables.length > 0) {
        return new StorageResults(409, 'table exists');
      }

      // use a temporary engram
      let engram = new Engram(this.engram.smt);
      engram.encoding = encoding;

      // create table on source
      let sql = sqlEncoder.sqlCreateTable(engram, this.options);
      logger.verbose(sql);
      let results = await this.pool.query(sql);

      // if successful update engram
      this.engram.encoding = encoding;
      return new StorageResults(0);
    }
    catch (err) {
      logger.warn("MySQLJunction: " + (err.code || err.message));
      throw this.StorageError(err);
    }
  }

  /**
   * Dull a schema at the locus.
   * Junction implementations will translate to delete file, DROP TABLE, delete index, etc.
   * @param {object} options optional, options.schema name to use instead of junction's smt.schema
   */
  async dullSchema(options) {
    logger.debug('MySQLJunction dullSchema');
    options = Object.assign({}, this.options, options);
    let schema = options?.schema || this.smt.schema;

    try {
      let sql = "DROP TABLE " + schema + ";";
      let results = await this.pool.query(sql);
      return new StorageResults(0);
    }
    catch (err) {
      if (err.errno === 1051)  // ER_BAD_TABLE_ERROR
        return new StorageResults(404, 'no such table');

      logger.warn("MySQLJunction: " + (err.code || err.message));
      throw this.StorageError(err);
    }
  }

  /**
   *
   * @param {object} construct - data object to store
   * @param {object} pattern - optional parameters, source dependent
   */
  async store(construct, pattern) {
    logger.debug("MySQLJunction store");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError(400, "unique keys not supported");
    if (typeOf(construct) !== "object")
      throw new StorageError(400, "Invalid parameter: construct is not an object");

    try {
      if (!this.engram.isDefined)
        await this.getEngram();

      let sql;
      if (this.options.withUpdate)
        sql = sqlEncoder.sqlInsertUpdate(this.engram, construct);
      else if (this.options.update)
        sql = sqlEncoder.sqlUpdate(this.engram, construct) + sqlEncoder.sqlWhereByKey(this.engram, construct);
      else
        sql = sqlEncoder.sqlInsert(this.engram, construct);
      logger.debug(sql);
      let results = await this.pool.query(sql);

      // check if row was inserted
      return new StorageResults("message", null, { stored: results.affectedRows });
    }
    catch (err) {
      if (err.errno === 1062) {  // ER_DUP_ENTRY
        return new StorageResults(409, 'duplicate entry');
      }

      logger.warn("MySQLJunction: " + (err.code || err.message));
      throw this.StorageError(err);
    }
  }

  /**
   *
   * @param {Array} constructs - array of data objects to store
   * @param {object} pattern - optional parameters, source dependent
   */
  async storeBulk(constructs, pattern) {
    logger.debug("MySQLJunction store");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError(400, "unique keys not supported");
    if (typeOf(constructs) !== "array")
      throw new StorageError(400, "Invalid parameter: construct is not an object");

    try {
      if (!this.engram.isDefined)
        await this.getEngram();

      let sql = sqlEncoder.sqlBulkInsert(this.engram, constructs);
      logger.debug(sql);
      let results = await this.pool.query(sql);

      // check if rows were inserted
      return new StorageResults("message", null, { stored: results.affectedRows });
    }
    catch (err) {
      if (err.errno === 1062) {  // ER_DUP_ENTRY
        return new StorageResults(409, 'duplicate entry');
      }

      logger.warn("MySQLJunction: " + (err.code || err.message));
      throw this.StorageError(err);
    }
  }

  /**
   *
   */
  async recall(pattern) {
    logger.debug("MySQLJunction recall");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError(400, "unique keys not supported");

    try {
      if (!this.engram.isDefined)
        await this.getEngram();

      let sql = "SELECT * FROM " + this.smt.schema + sqlEncoder.sqlWhereByKey(this.engram, pattern);
      logger.verbose(sql);
      let rows = await this.pool.query(sql);

      if (rows.length > 0)
        sqlEncoder.decodeResults(this.engram, rows[ 0 ]);

      let storageResults;
      if (rows.length > 0)
        storageResults = new StorageResults("construct", null, rows[ 0 ]);
      else
        storageResults = new StorageResults(404);
      return storageResults;
    }
    catch (err) {
      logger.warn("MySQLJunction: " + (err.code || err.message));
      throw this.StorageError(err);
    }
  }

  /**
   *
   * @param {*}  pattern
   */
  async retrieve(pattern) {
    logger.debug("MySQLJunction retrieve");
    pattern = pattern?.pattern || pattern || {};

    try {
      if (!this.engram.isDefined)
        await this.getEngram();

      let sql = sqlEncoder.sqlSelectByPattern(this.engram, pattern);
      logger.verbose(sql);

      let rows = await this.pool.query(sql);

      for (let i = 0; i < rows.length; i++)
        sqlEncoder.decodeResults(this.engram, rows[ i ]);

      let storageResults;
      if (rows.length > 0)
        storageResults = new StorageResults(0, null, rows);
      else
        storageResults = new StorageResults(404);
      return storageResults;
    }
    catch (err) {
      logger.warn("MySQLJunction: " + (err.code || err.message));
      throw this.StorageError(err);
    }
  }

  /**
   *
   */
  async dull(pattern) {
    logger.debug("MySQLJunction dull");
    pattern = pattern?.pattern || pattern || {};

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError(400, "unique keys not supported");

    try {
      if (!this.engram.isDefined)
        await this.getEngram();

      let sql = "";
      if (pattern.match === "*") {
        // delete all constructs in the .schema
        sql = "TRUNCATE " + this.smt.schema + ";";
      }
      else if (this.engram.keyof === 'primary') {
        // delete construct by ID
        sql = "DELETE FROM " + this.smt.schema + sqlEncoder.sqlWhereByKey(this.engram, pattern);
      }
      logger.verbose(sql);

      let results = await this.pool.query(sql);
      return new StorageResults("message", null, { deleted: results.affectedRows });
    }
    catch (err) {
      logger.warn("MySQLJunction: " + (err.code || err.message));
      throw this.StorageError(err);
    }
  }


  /**
   * Convert a source datastore error into a StorageError
   *
   * @param {*} err a data source error object
   * @returns a new StorageError object
   */
  StorageError(err) {
    if (err instanceof StorageError)
      return err;

    let status = 500;
    let message = err.code;

    // derived classes should override method
    // and implement error conversion logic

    return new StorageError(status, message, { cause: err });
  }
};

// define module exports
MySQLJunction.encoder = encoder;
MySQLJunction.sqlEncoder = sqlEncoder;
module.exports = exports = MySQLJunction;
