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
const { StorageResults, StorageError } = require("../types");
const logger = require('../logger');

const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

module.exports = exports = class OracleDBJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'oracle|host=address;user=name;password=xyz;database=dbname;...|table|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("OracleDBJunction");

    this.engram.caseInsensitive = true;

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

  }

  async activate() {
    this._isActive = true;
    logger.debug("OracleDBJunction activate");

    this.pool = await oracledb.createPool({
      connectString: this.options.connectString || 'localhost/XE',
      user: this.options.user || 'system',
      password: this.options.password || ''
    });
  }

  async relax() {
    this._isActive = false;
    logger.debug("OracleDBJunction relax");

    try {
      // release an resources
      await this.pool.close(0);
    }
    catch (err) {
      logger.error(err);
    }

    super.relax();
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
      logger.error(err.message);
      throw err;
    }
    finally {
      if (connection) {
        try {
          await connection.close();
        }
        catch (err) {
          logger.error(err.message);
          throw err;
        }
      }
    }

    return list;
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    logger.debug("OracleDBJunction getEncoding");

    let connection;
    try {
      // fetch encoding form storage source
/*
      let sql = "DESCRIBE " + this.smt.schema + ";";
      connection = await this.pool.getConnection();
      let results = await connection.execute(sql);
      let columns = results.rows;

      for (let i = 0; i < columns.length; i++) {
        let field = encoder.storageField(columns[i]);
        this.engram.add(field);
      }
*/
      // get column metadata
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

      // get primary keys
      // get column metadata
      sql = sqlEncoder.sqlConstraintColumns(this.smt.schema);      
      connection = await this.pool.getConnection();
      results = await connection.execute(sql);

      for (let row of results.rows) {
        let field = this.engram.find(row["COLUMN_NAME"]);
        field["isKey"] = true;
      }      

      return this.engram;
    }
    catch (err) {
      if (err.errorNum === 942)  // ER_NO_SUCH_TABLE
        return 'not found';

      logger.error(err);
      throw err;
    }
    finally {
      if (connection) {
        try {
          await connection.close();
        }
        catch (err) {
          logger.error(err);
          throw err;
        }
      }
    }
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async putEncoding(encoding, overlay=false) {
    logger.debug("OracleDBJunction putEncoding");

    if (overlay) {
      this.engram.replace(encoding);
      return this.engram;
    }
    
    let connection;
    try {
      // check if table already exists
      let sql = "SELECT table_name FROM user_tables WHERE table_name='" + this.smt.schema.toUpperCase() + "'";
      connection = await this.pool.getConnection();
      let results = await connection.execute(sql);
      let tables = results.rows;

      if (tables.length > 0) {
        return 'schema exists';
      }

      let engram = new Engram(this.engram);
      engram.replace(encoding);

      // create table
      sql = sqlEncoder.sqlCreateTable(engram);
      connection = await this.pool.getConnection();
      results = await connection.execute(sql);
      this.engram.replace(encoding);

      return this.engram;
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
    finally {
      if (connection) {
        try {
          await connection.close();
        }
        catch (err) {
          logger.error(err);
          throw err;
        }
      }
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
    if (typeof construct !== "object")
      throw new StorageError({ statusCode: 400 }, "Invalid parameter: construct is not an object");

    let connection;
    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();
      
      connection = await this.pool.getConnection();
      let results = {};
      if (this.engram.keys.length > 0) {
        let sql = sqlEncoder.sqlUpdate(this.engram, construct);
        logger.debug(sql);
        results = await connection.execute(sql, {}, { autoCommit: true });
      }
      if (!results.rowsAffected) {
        let sql = sqlEncoder.sqlInsert(this.engram, construct);
        logger.debug(sql);
        results = await connection.execute(sql, {}, { autoCommit: true });
      }

      // check if row was inserted/updated
      return new StorageResults((results.rowsAffected > 0) ? "ok" : "not stored", null, null, null);
    }
    catch (err) {
      if (err.errorNum === 1 || err.errorNum === 3342)
        return new StorageResults('duplicate', null, null, err);

      logger.error(err);
      throw err;
    }
    finally {
      if (connection) {
        try {
          await connection.close();
        }
        catch (err) {
          logger.error(err);
          throw err;
        }
      }
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
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let sql = "SELECT * FROM " + this.smt.schema + sqlEncoder.sqlWhereFromKey(this.engram, pattern);
      logger.debug(sql);
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
      if (connection) {
        try {
          await connection.close();
        }
        catch (err) {
          logger.error(err);
          throw err;
        }
      }
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
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let sql = sqlEncoder.sqlSelectWithPattern(this.engram, pattern);
      logger.debug(sql);
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
      if (connection) {
        try {
          await connection.close();
        }
        catch (err) {
          logger.error(err);
          throw err;
        }
      }
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
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let results = null;
      if (this.engram.keyof === 'primary' || this.engram.keyof === 'all') {
        // delete construct by ID
        let sql = "DELETE FROM " + this.smt.schema + sqlEncoder.sqlWhereFromKey(this.engram, pattern);
        connection = await this.pool.getConnection();
        results = await connection.execute(sql, {}, {autoCommit: true});
      }
      else {
        // delete all constructs in the .schema
        let sql = "TRUNCATE " + this.smt.schema + ";";
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
      if (connection) {
        try {
          await connection.close();
        }
        catch (err) {
          logger.error(err);
          throw err;
        }
      }
    }
  }

};
