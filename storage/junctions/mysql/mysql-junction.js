/**
 * mysql/junction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const { Engram, StorageResponse, StorageError } = require("../../types");
const { typeOf, logger } = require("../../utils");

const MySQLReader = require("./mysql-reader");
const MySQLWriter = require("./mysql-writer");
const encoder = require("./mysql-encoder");
const sqlEncoder = require("./mysql-encoder-sql");

const mysql = require('mysql');
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
      logger.error(err);
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

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      let list = [];

      let rx = '^' + schema + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
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

      return new StorageResponse(0, null, list);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
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

      return new StorageResponse("encoding", null, this.engram.encoding);
    }
    catch (err) {
      if (err.errno === 1146)  // ER_NO_SUCH_TABLE
        return new StorageResponse(404, 'no such table');

      logger.error(err);
      throw new StorageError(500).inner(err);
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
        return new StorageResponse(409, 'table exists');
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
      return new StorageResponse("encoding", null, this.engram.encoding);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   * Dull a schema at the locus.
   * Junction implementations will translate to delete file, DROP TABLE, delete index, etc.
   * @param {Object} options optional, options.schema name to use instead of junction's smt.schema
   */
  async dullSchema(options) {
    logger.debug('MySQLJunction dullSchema');
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;

    try {
      let sql = "DROP TABLE " + schema + ";";
      let results = await this.pool.query(sql);
      return new StorageResponse(0);
    }
    catch (err) {
      if (err.errno === 1051)  // ER_BAD_TABLE_ERROR
        return new StorageResponse(404, 'no such table');

      logger.error(err);
      throw new StorageError(500).inner(err);
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
      throw new StorageError(400, "unique keys not supported");
    if (typeOf(construct) !== "object")
      throw new StorageError(400, "Invalid parameter: construct is not an object");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let sql = sqlEncoder.sqlInsertUpdate(this.engram, construct);
      logger.debug(sql);
      let results = await this.pool.query(sql);

      // check if row was inserted
      return new StorageResponse("message", null, { stored: results.affectedRows });
    }
    catch (err) {
      if (err.errno === 1062) {  // ER_DUP_ENTRY
        return new StorageResponse(409, 'duplicate entry');
      }

      logger.error(err);
      throw new StorageError(500).inner(err);
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
      throw new StorageError(400, "unique keys not supported");
    if (typeOf(constructs) !== "array")
      throw new StorageError(400, "Invalid parameter: construct is not an object");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let sql = sqlEncoder.sqlBulkInsert(this.engram, constructs);
      logger.debug(sql);
      let results = await this.pool.query(sql);

      // check if rows were inserted
      return new StorageResponse("message", null, { stored: results.affectedRows });
    }
    catch (err) {
      if (err.errno === 1062) {  // ER_DUP_ENTRY
        return new StorageResponse(409, 'duplicate entry');
      }

      logger.error(err);
      throw new StorageError(500).inner(err);
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
        await this.getEncoding();

      let sql = "SELECT * FROM " + this.smt.schema + sqlEncoder.sqlWhereByKey(this.engram, pattern);
      logger.verbose(sql);
      let rows = await this.pool.query(sql);

      if (rows.length > 0)
        sqlEncoder.decodeResults(this.engram, rows[ 0 ]);

      let response;
      if (rows.length > 0)
        response = new StorageResponse("construct", null, rows[ 0 ]);
      else
        response = new StorageResponse(404);
      return response;
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
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

      let sql = sqlEncoder.sqlSelectByPattern(this.engram, pattern);
      logger.verbose(sql);
      let rows = await this.pool.query(sql);

      for (let i = 0; i < rows.length; i++)
        sqlEncoder.decodeResults(this.engram, rows[ i ]);

      let response;
      if (rows.length > 0)
        response = new StorageResponse(0, null, rows);
      else
        response = new StorageResponse(404);
      return response;
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   *
   */
  async dull(pattern) {
    logger.debug("MySQLJunction dull");
    if (!pattern) pattern = {};

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError(400, "unique keys not supported");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let results = null;
      if (this.engram.keyof === 'primary') {
        // delete construct by ID
        let sql = "DELETE FROM " + this.smt.schema + sqlEncoder.sqlWhereByKey(this.engram, pattern);
        logger.verbose(sql);
        results = await this.pool.query(sql);
      }
      else {
        // delete all constructs in the .schema
        let sql = "TRUNCATE " + this.smt.schema + ";";
        logger.verbose(sql);
        results = await this.pool.query(sql);
      }

      return new StorageResponse("message", null, { deleted: results.affectedRows });
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

};

// define module exports
MySQLJunction.encoder = encoder;
MySQLJunction.sqlEncoder = sqlEncoder;
module.exports = MySQLJunction;
