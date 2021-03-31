// storage/junctions/transportdb-junction
"use strict";

const StorageJunction = require("../storage-junction");
const { Engram, StorageResults, StorageError } = require("../../types");
const { typeOf } = require("../../utils");
const logger = require('../../logger');

const TransportDBReader = require("./transportdb-reader");
const TransportDBWriter = require("./transportdb-writer");
//const encoder = require('./transportdb-encoder');
const encoder = require("../oracledb/oracledb-encoder");
const sqlEncoder = require("../oracledb/oracledb-sql-encoder");

const stream = require('stream/promises');
const httpRequest = require("../../utils/httpRequest");

class TransportDBJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'transportdb|host|endpoint|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("TransportDBJunction");

    this._readerClass = TransportDBReader;
    this._writerClass = TransportDBWriter;

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

  async activate() {
    this._isActive = true;
    logger.debug("TransportDBJunction activate");

    try {
      if (this.options.bulkLoad) {
        let request = {
          model: 'oracledb',
          method: 'createSchema',
          sql: sqlEncoder.sqlActivate(this.smt.schema)
        }
        if (request.sql) {
          let res = await httpRequest(this.url, this.reqOptions, JSON.stringify(request));
          let response = JSON.parse(res.data);
        }
      }
    }
    catch (err) {
      logger.error(err);
    }
  }

  async relax() {
    this._isActive = false;
    logger.debug("TransportDBJunction relax");

    try {
      // release an resources
      if (this.options.bulkLoad) {
        let request = {
          model: 'oracledb',
          method: 'createSchema',
          sql: sqlEncoder.sqlRelax(this.smt.schema)
        }
        if (request.sql) {
          let res = await httpRequest(this.url, this.reqOptions, JSON.stringify(request));
          let response = JSON.parse(res.data);
        }
      }
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
    logger.debug('TransportDBJunction list');
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
        logger.debug("TransportDBJunction createSchema");

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
      let rowsAffected = resultCode ? 0 : response.data[0].rowsAffected;
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
   * @param {Array} constructs - array of data objects to store
   * @param {Object} pattern - optional parameters, source dependent
   */
  async storeBulk(constructs, pattern) {
    logger.debug("TransportDBJunction storeBulk");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError( 400, "unique keys not supported");
    if (typeOf(constructs) !== "array")
      throw new StorageError( 400, "Invalid parameter: construct is not an object");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let request = {
        model: 'oracledb',
        method: 'storeBulk',
        sql: sqlEncoder.sqlBulkInsert(this.engram, constructs)
      }
      logger.debug(request.sql);

      let res = await httpRequest(this.url, this.reqOptions, JSON.stringify(request));
      let response = JSON.parse(res.data);

      let resultCode = response.resultCode;
      if (resultCode) {
        throw new StorageError(resultCode, response.resultText);
      }
      let rowsAffected = resultCode ? 0 : response.data[0].rowsAffected;
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
    logger.debug("TransportDBJunction recall");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError( 400, "unique keys not supported");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let request = {
        model: 'oracledb',
        method: 'recall',
        sql: sqlEncoder.sqlSelectByKey(this.engram, pattern)
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
    logger.debug("TransportDBJunction retrieve");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let request = {
        model: 'oracledb',
        method: 'retrieve',
        sql: sqlEncoder.sqlSelectByPattern(this.engram, pattern)
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
    logger.debug("TransportDBJunction dull");
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

      if (this.engram.keyof === 'primary') {
        // delete construct by ID
        request.sql = sqlEncoder.sqlDeleteByKey(this.engram, pattern);
      }
      else if (pattern.match) {
        request.sql = sqlEncoder.sqlDeleteByPattern(this.engram, pattern);
      }
      else {
        // delete all constructs in the .schema
        request.sql = sqlEncoder.sqlTruncateTable(this.smt.schema);
      }
      logger.debug(request.sql);

      let res = await httpRequest(this.url, this.reqOptions, JSON.stringify(request));
      let response = JSON.parse(res.data);

      let resultCode = response.resultCode;
      let rowsAffected = resultCode ? 0 : response.data[0].rowsAffected;
      return new StorageResults(resultCode, null, rowsAffected, "rowsAffected");
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

};

// define module exports
//TransportDBJunction.encoder = encoder;
module.exports = TransportDBJunction;
