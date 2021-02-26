/**
 * oracledb-junction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const OracleDBReader = require("./reader");
const OracleDBWriter = require("./writer");
const encoder = require("./encoder");
const sqlEncoder = require("./encoder_sql");
const Engram = require("../engram");
const { typeOf, hasOwnProperty, StorageResults, StorageError } = require("../types");
const logger = require('../logger');

const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];
oracledb.fetchAsBuffer = [oracledb.BLOB];

class OracleDBJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|=Foo' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("OracleDBJunction");

    //this.engram.caseInsensitive = true;

    this._readerClass = OracleDBReader;
    this._writerClass = OracleDBWriter;

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
    
    if (!OracleDBJunction._driverIntialized) {
      OracleDBJunction._driverIntialized = true;
      oracledb.initOracleClient();
    }
  }

  async activate() {
    this._isActive = true;
    logger.debug("OracleDBJunction activate");

    let connection;
    try {
      this.pool = await oracledb.createPool({
        connectString: this.options.connectString || 'localhost/XE',
        user: this.options.user || 'system',
        password: this.options.password || ''
      });

      if (this.options.bulkLoad) {
        let sql = "ALTER TABLE " + this.smt.schema + " NOLOGGING";
        connection = await this.pool.getConnection();
        let results = await connection.execute(sql);
      }
    }
    catch (err) {
      logger.error(err);
    }
    finally {
      if (connection)
        await connection.close();
    }
  }

  async relax() {
    this._isActive = false;
    logger.debug("OracleDBJunction relax");

    try {
      // release an resources
      if (this.options.bulkLoad) {
        let sql = "ALTER TABLE " + this.smt.schema + " LOGGING";
        let connection = await this.pool.getConnection();
        let results = await connection.execute(sql);
        await connection.close();
      }

      await this.pool.close(0);
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
    logger.debug('OracleDBJunction list');
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let list = [];

    let connection;
    try {
      let rx = '^' + schema.toUpperCase() + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      // fetch encoding form storage source
      let sql = "SELECT table_name FROM user_tables";
      connection = await this.pool.getConnection();
      let results = await connection.execute(sql);
      let tables = results.rows;

      for (let table of tables) {
        let name = table["TABLE_NAME"];
        if (rx.test(name))
          list.push(name);
      }
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
    finally {
      if (connection)
        await connection.close();
    }

    return list;
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    logger.debug("OracleDBJunction get encoding");

    let connection;
    try {
      // fetch encoding form storage source

      // get one row w/ metadata
      let sql = sqlEncoder.sqlDescribeTable(this.smt.schema);
      connection = await this.pool.getConnection();
      let results = await connection.execute(sql, {}, {
        resultSet: true,
        extendedMetaData: true
      });
      for (let column of results.metaData) {
        let field = encoder.storageField(column);
        this.engram.add(field);
      }

      // get indexes
      sql = sqlEncoder.sqlDescribeIndexes(this.smt.schema);
      results = await connection.execute(sql);
      sqlEncoder.decodeIndexResults(this.engram, results);
    }
    catch (err) {
      if (err.errorNum === 942)  // ER_NO_SUCH_TABLE
        return 'not found';

      logger.error(err);
      throw err;
    }
    finally {
      if (connection)
        await connection.close();
    }

    return this.engram;
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async createSchema(options={}) {
    logger.debug("OracleDBJunction createSchema");

    let connection;
    try {
      let encoding = options.encoding || this.engram.encoding;

      // check if table already exists
      let tables = this.list();
      if (tables.length > 0) {
        return 'schema exists';
      }

      // use a temporary engram
      let engram = new Engram(this.engram.smt);
      engram.encoding = encoding;

      // create table
      let sql = sqlEncoder.sqlCreateTable(engram, this.options);
      logger.verbose(sql);
      connection = await this.pool.getConnection();
      let results = await connection.execute(sql);

      // if successful update engram
      this.engram.encoding = encoding;

      // Oracle create indices
      if (!this.options.bulkLoad && this.engram.indices) {
        for (let indexName of Object.keys(this.engram.indices)) {
          sql = sqlEncoder.sqlCreateIndex(engram, indexName);
          logger.verbose(sql);
          results = await connection.execute(sql);
        }
      }
      return this.engram;
    }
    catch (err) {
      if (err.errorNum === 955)
        return "schema exists";
      
      logger.error(err);
      throw err;
    }
    finally {
      if (connection)
        await connection.close();
    }
  }

  /**
   * Dull a schema at the locus. 
   * Junction implementations will translate to delete file, DROP TABLE, delete index, etc.
   * @param {Object} options optional, options.schema name to use instead of junction's smt.schema
   */
  async dullSchema(options) {
    logger.debug('OracleJunction dullSchema');
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    
    let connection;
    try {
      let sql = "DROP TABLE " + schema;
      connection = await this.pool.getConnection();
      let results = await connection.execute(sql);
    }
    catch (err) {
      if (err.errorNum === 942)  // ER_NO_SUCH_TABLE
        return 'not found';

      logger.error(err);
      throw err;
    }
    finally {
      if (connection)
        await connection.close();
    }
    return "ok";
  }

  async _request(sql) {
    let connection;
    try {
      connection = await this.pool.getConnection();
      let results = await connection.execute(sql, [], { autoCommit: !this.options.bulkLoad });
      return results.rowsAffected;
    }
    catch (err) {
      if (err.errorNum === 1 || err.errorNum === 3342)
        return 0; // duplicate key
      throw err;      
    }
    finally {
      if (connection)
        await connection.close();
    }
  }

 /**
   *
   * @param {*} construct
   */
  async store(construct, pattern) {
    logger.debug("OracleDBJunction store");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");
    if (typeOf(construct) !== "object")
      throw new StorageError({ statusCode: 400 }, "Invalid parameter: construct is not an object");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();
      
      // Insert/Update logic
      let sql = sqlEncoder.sqlInsert(this.engram, construct);
      logger.debug(sql);
      let rowsAffected = await this._request(sql);

      if (rowsAffected === 0 && this.engram.keys.length > 0 && this.engram.keys.length < this.engram.fieldsLength) {
        let sql = sqlEncoder.sqlUpdate(this.engram, construct);
        logger.debug(sql);
        rowsAffected = await this._request(sql);
      }

      return new StorageResults((rowsAffected > 0) ? "ok" : "not stored", null, null, null);
    }
    catch (err) {
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
    logger.debug("OracleJunction store");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");
    if (typeOf(constructs) !== "array")
      throw new StorageError({ statusCode: 400 }, "Invalid parameter: construct is not an object");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let sql = sqlEncoder.sqlBulkInsert(this.engram, constructs);
      logger.debug(sql);
      let rowsAffected = await this._request(sql);

      return new StorageResults((rowsAffected > 0) ? "ok" : "not stored", null, null, null);
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
    logger.debug("OracleDBJunction recall");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");

    let connection;
    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let sql = "SELECT * FROM " + this.smt.schema + sqlEncoder.sqlWhereFromKey(this.engram, pattern);
      logger.verbose(sql);
      connection = await this.pool.getConnection();
      let results = await connection.execute(sql);
      let rows = results.rows;

      if (rows.length > 0)
        sqlEncoder.decodeResults(this.engram, rows[0]);

      return new StorageResults((rows.length > 0) ? "ok" : "not found", rows[0]);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
    finally {
      if (connection)
        await connection.close();
    }
  }

  /**
   *
   * @param {*}  pattern
   */
  async retrieve(pattern) {
    logger.debug("OracleDBJunction retrieve");

    let connection;
    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let sql = sqlEncoder.sqlSelectWithPattern(this.engram, pattern);
      logger.verbose(sql);
      connection = await this.pool.getConnection();
      let results = await connection.execute(sql);
      let rows = results.rows;

      for (let i = 0; i < rows.length; i++)
        sqlEncoder.decodeResults(this.engram, rows[i]);

      return new StorageResults((rows.length > 0) ? "ok" : "not found", rows);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
    finally {
      if (connection)
        await connection.close();
    }
  }

  /**
   *
   */
  async dull(pattern) {
    logger.debug("OracleDBJunction dull");
    if (!pattern) pattern = {};

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");

    let connection;
    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let results = null;
      if (this.engram.keyof === 'primary' || this.engram.keyof === 'all') {
        // delete construct by ID
        let sql = "DELETE FROM " + this.smt.schema + sqlEncoder.sqlWhereFromKey(this.engram, pattern);
        logger.verbose(sql);
        connection = await this.pool.getConnection();
        results = await connection.execute(sql);
      }
      else {
        // delete all constructs in the .schema
        let sql = "TRUNCATE " + this.smt.schema + ";";
        logger.verbose(sql);
        connection = await this.pool.getConnection();
        results = await connection.execute(sql);
      }

      return new StorageResults((results.rowsAffected > 0) ? "ok" : "not found", null, null, (this.options.meta ? results : null));
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
    finally {
      if (connection)
        await connection.close();
    }
  }

};

OracleDBJunction._driverIntialized = false;

// define module exports
OracleDBJunction.encoder = encoder;
OracleDBJunction.sqlEncoder = sqlEncoder;
module.exports = OracleDBJunction;
