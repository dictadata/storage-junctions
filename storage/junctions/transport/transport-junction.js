// storage/junctions/transport-junction
"use strict";

const StorageJunction = require("../storage-junction");
const { Engram, StorageResults, StorageError } = require("../../types");
const { typeOf } = require("../../utils");
const logger = require('../../logger');

const TransportReader = require("./transport-reader");
const TransportWriter = require("./transport-writer");
//const encoder = require('./transport-encoder');
const encoder = require("../oracledb/oracledb-encoder");
const sqlEncoder = require("../oracledb/oracledb-sql-encoder");

const stream = require('stream/promises');
const httpRequest = require("../../utils/httpRequest");

class TransportJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'transport|host|endpoint|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("TransportJunction");

    this._readerClass = TransportReader;
    this._writerClass = TransportWriter;

    if (this.options.stringBreakpoints)
      Object.assign(encoder.stringBreakpoints, this.options.stringBreakpoints);
    
    this.url = this.options.url || '';
    this.reqOptions = {
      method: this.options.method || "POST",
      origin: this.options.origin || this.smt.locus,
      headers: Object.assign({ 'Accept': 'application/json', 'User-Agent': '@dictadata.org/storage' }, this.options.headers),
      timeout: this.options.timeout || 10000
    };
    if (this.options.auth)
      this.reqOptions["auth"] = this.options.auth;
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
    logger.debug('TransportJunction list');
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let list = [];

    try {
      let rx = '^' + schema.toUpperCase() + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      // fetch schema list from storage source
      let request = {
        model: 'oracledb',
        method: 'list',
        sql: sqlEncoder.sqlListTables()
      }

      let res = await httpRequest(this.url, this.reqOptions, JSON.stringify(request));
      let response = JSON.parse(res.data);
      if (response.resultCode !== 0) {
        throw new StorageError(response.resultCode, response.resultText);
      }

      let tables = response.data || response;
      for (let table of tables) {
        let name = table["TABLE_NAME"];
        if (rx.test(name))
          list.push(name);
      }
    }
    catch (err) {
      logger.error(err);
      if (err instanceof StorageError)
        throw err;
      else
        throw new StorageError(500).inner(err);
    }

    return new StorageResults(0, null, list);
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    logger.debug("OracleDBJunction get encoding");

    try {
      // fetch encoding form storage source

      // get one row w/ metadata
      let request = {
        model: 'oracledb',
        method: 'getEncoding',
        sql: sqlEncoder.sqlDescribeTable(this.smt.schema)
      }

      let res = await httpRequest(this.url, this.reqOptions, JSON.stringify(request));
      let response = JSON.parse(res.data);
      if (response.resultCode !== 0) {
        throw new StorageError(response.resultCode, response.resultText);
      }

      for (let column of response.data) {
        let field = encoder.storageField(column);
        this.engram.add(field);
      }

      // get indexes
      request.sql = sqlEncoder.sqlDescribeIndexes(this.smt.schema);
      res = await httpRequest(this.url, this.reqOptions, JSON.stringify(request));
      response = JSON.parse(res.data);
      if (response.resultCode !== 0) {
        throw new StorageError(response.resultCode, response.resultText);
      }

      response.rows = response.data;  // oracledb returns rows
      sqlEncoder.decodeIndexResults(this.engram, response);

      return new StorageResults(0, null, this.engram.encoding, "encoding");
    }
    catch (err) {
      if (err.errorNum === 942)  // ER_NO_SUCH_TABLE
        return new StorageResults(404, 'table not found');

      logger.error(err);
      if (err instanceof StorageError)
        throw err;
      else
        throw new StorageError(500).inner(err);
    }
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async createSchema(options={}) {
        logger.debug("TransportJunction createSchema");

    try {
      let encoding = options.encoding || this.engram.encoding;

      // check if table already exists
      let { data: tables } = await this.list();
      if (tables.length > 0) {
        return new StorageResults(409, 'schema exists');
      }

      // use a temporary engram
      let engram = new Engram(this.engram.smt);
      engram.encoding = encoding;

      // create table
      let request = {
        model: 'oracledb',
        method: 'createSchema',
        sql: sqlEncoder.sqlCreateTable(engram, this.options)
      }
      logger.verbose(request.sql);

      let res = await httpRequest(this.url, this.reqOptions, JSON.stringify(request));
      let response = JSON.parse(res.data);
      if (response.resultCode !== 0) {
        throw new StorageError(response.resultCode, response.resultText);
      }

      // if successful update engram
      this.engram.encoding = encoding;

      // Oracle create indices
      if (!this.options.bulkLoad && this.engram.indices) {
        request.method = 'createIndex';
        for (let indexName of Object.keys(this.engram.indices)) {
          request.sql = sqlEncoder.sqlCreateIndex(engram, indexName);
          logger.verbose(sql);
          res = await httpRequest(this.url, this.reqOptions, JSON.stringify(request));
          response = JSON.parse(res.data);
          if (response.resultCode !== 0) {
            throw new StorageError(response.resultCode, response.resultText);
          }
        }
      }

      return new StorageResults(0);
    }
    catch (err) {
      if (err.errorNum === 955)
        return new StorageResults(409, "schema exists");
      
      logger.error(err);
      if (err instanceof StorageError)
        throw err;
      else
        throw new StorageError(500).inner(err);
    }
  }

  /**
   * Dull a schema at the locus. 
   * Junction implementations will translate to delete file, DROP TABLE, delete index, etc.
   * @param {Object} options optional, options.schema name to use instead of junction's smt.schema
   */
  async dullSchema(options) {
    logger.debug('OracleDBJunction dullSchema');
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    
    try {
      let request = {
        model: 'oracledb',
        method: 'dullSchema',
        sql: sqlEncoder.sqlDropTable(schema)
      }

      let res = await httpRequest(this.url, this.reqOptions, JSON.stringify(request));
      let response = JSON.parse(res.data);
      
      if (response.resultCode !== 0) {
        if (response.resultCode === 942)  // ER_NO_SUCH_TABLE
          return new StorageResults(404, 'table not found');

        throw new StorageError(response.resultCode, response.resultText);
      }

      return new StorageResults(0);
    }
    catch (err) {
      logger.error(err);
      if (err instanceof StorageError)
        throw err;
      else
        throw new StorageError(500).inner(err);
    }

  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern) {
    logger.debug("Transport store");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError( 400, "unique keys not supported");
    if (typeOf(construct) !== "object")
      throw new StorageError( 400, "Invalid parameter: construct is not an object");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();
      
      // Insert/Update logic
      let request = {
        model: 'oracledb',
        method: 'store',
        sql: sqlEncoder.sqlInsert(this.engram, construct)
      }
      logger.debug(request.sql);

      let res = await httpRequest(this.url, this.reqOptions, JSON.stringify(request));
      let response = JSON.parse(res.data);
      // check for duplicate key result
      if (response.resultCode !== 0 && response.resultCode !== 1 && response.resultCode !== 3342) {
        throw new StorageError(response.resultCode, response.resultText);
      }

      if (response.resultCode !== 0 && this.engram.keys.length > 0 && this.engram.keys.length < this.engram.fieldsLength) {
        request.sql = sqlEncoder.sqlUpdate(this.engram, construct);
        logger.debug(request.sql);

        res = await httpRequest(this.url, this.reqOptions, JSON.stringify(request));
        response = JSON.parse(res.data);
        if (response.resultCode !== 0) {
          throw new StorageError(response.resultCode, response.resultText);
        }
      }

      let resultCode = response.resultCode;
      let rowsAffected = resultCode ? 0 : response.data.rowsAffected;

      return new StorageResults(resultCode, null, rowsAffected, "rowsAffected");
    }
    catch (err) {
      logger.error(err);
      if (err instanceof StorageError)
        throw err;
      else
        throw new StorageError(500).inner(err);
    }
  }

  /**
   *
   */
  async recall(pattern) {
    logger.debug("TransportJunction recall");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError( 400, "unique keys not supported");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let request = {
        model: 'oracledb',
        method: 'recall',
        sql: "SELECT * FROM " + this.smt.schema + sqlEncoder.sqlWhereFromKey(this.engram, pattern)
      }
      logger.debug(request.sql);

      let res = await httpRequest(this.url, this.reqOptions, JSON.stringify(request));
      let response = JSON.parse(res.data);

      let rows = response.data;
      if (rows.length > 0)
        sqlEncoder.decodeResults(this.engram, rows[0]);

      let resultCode = rows.length > 0 ? 200 : 404;
      return new StorageResults(resultCode, null, (rows.length > 0) ? rows[0] : null);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }

  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {
    logger.debug("TransportJunction retrieve");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let request = {
        model: 'oracledb',
        method: 'retrieve',
        sql: sqlEncoder.sqlSelectWithPattern(this.engram, pattern)
      }
      logger.debug(request.sql);
      
      let res = await httpRequest(this.url, this.reqOptions, JSON.stringify(request));
      let response = JSON.parse(res.data);

      let rows = response.data;
      for (let i = 0; i < rows.length; i++)
        sqlEncoder.decodeResults(this.engram, rows[i]);

      let resultCode = rows.length > 0 ? 200 : 404;
      return new StorageResults(resultCode, null, rows);
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
    logger.debug("TransportJunction dull");
    if (!pattern) pattern = {};

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError( 400, "unique keys not supported");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let request = {
        model: 'oracledb',
        method: 'dull',
        sql: ''
      }

      if (this.engram.keyof === 'primary' || this.engram.keyof === 'all') {
        // delete construct by ID
        request.sql = "DELETE FROM " + this.smt.schema + sqlEncoder.sqlWhereFromKey(this.engram, pattern);
      }
      else {
        // delete all constructs in the .schema
        request.sql = "TRUNCATE " + this.smt.schema + ";";
      }
      logger.debug(request.sql);

      let res = await httpRequest(this.url, this.reqOptions, JSON.stringify(request));
      let response = JSON.parse(res.data);

      return new StorageResults(0, null, response.rowsAffected, "rowsAffected");
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

};

// define module exports
//TransportJunction.encoder = encoder;
module.exports = TransportJunction;
