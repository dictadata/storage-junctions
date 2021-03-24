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
    this.request = {
      method: this.options.method || "POST",
      origin: this.options.origin || this.smt.locus,
      headers: Object.assign({ 'Accept': 'application/json', 'User-Agent': '@dictadata.org/storage' }, this.options.headers),
      timeout: this.options.timeout || 10000
    };
    if (this.options.auth)
      this.request["auth"] = this.options.auth;
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
      let query = {
        model: 'oracledb',
        method: 'list',
        sql: sqlEncoder.sqlListTables()
      }

      let response = await httpRequest(this.url, this.request, JSON.stringify(query));
      let results = JSON.parse(response.data);

      let tables = results.rows || results;
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

    return list;
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
      let query = {
        model: 'oracledb',
        method: 'getEncoding',
        sql: sqlEncoder.sqlDescribeTable(this.smt.schema)
      }

      let response = await httpRequest(this.url, this.request, JSON.stringify(query));
      let results = JSON.parse(response.data);

      for (let column of results.metaData) {
        let field = encoder.storageField(column);
        this.engram.add(field);
      }

      // get indexes
      request.sql = sqlEncoder.sqlDescribeIndexes(this.smt.schema);
      response = await httpRequest(url, request, JSON.stringify(query));
      results = JSON.parse(response.data);

      sqlEncoder.decodeIndexResults(this.engram, results);
    }
    catch (err) {
      if (err.errorNum === 942)  // ER_NO_SUCH_TABLE
        return 'not found';

      logger.error(err);
      throw err;
    }

    return this.engram;
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
      let tables = await this.list();
      if (tables.length > 0) {
        return 'schema exists';
      }

      // use a temporary engram
      let engram = new Engram(this.engram.smt);
      engram.encoding = encoding;

      // create table
      let query = {
        model: 'oracledb',
        method: 'createSchema',
        sql: sqlEncoder.sqlCreateTable(engram, this.options)
      }
      logger.verbose(request.sql);

      let response = await httpRequest(this.url, this.request, JSON.stringify(sql));
      let results = JSON.parse(response.data);
      // note, should throw error if table exists

      // if successful update engram
      this.engram.encoding = encoding;

      // Oracle create indices
      if (!this.options.bulkLoad && this.engram.indices) {
        query.method = 'createIndex';
        for (let indexName of Object.keys(this.engram.indices)) {
          query.sql = sqlEncoder.sqlCreateIndex(engram, indexName);
          logger.verbose(sql);
          response = await httpRequest(this.url, this.request, JSON.stringify(sql));
          results = JSON.parse(response.data);
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
      let query = {
        model: 'oracledb',
        method: 'dullSchema',
        sql: sqlEncoder.sqlDropTable(schema)
      }

      let response = await httpRequest(this.url, this.request, JSON.stringify(sql));
      let results = JSON.parse(response.data);
    }
    catch (err) {
      if (err.errorNum === 942)  // ER_NO_SUCH_TABLE
        return 'not found';

      logger.error(err);
      throw err;
    }

    return "ok";
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern) {
    if (typeOf(construct) !== "object")
      throw new StorageError({ statusCode: 400 }, "Invalid parameter: construct is not an object");

    try {
      return new this.StorageResults('invalid');
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   */
  async recall(pattern) {
    if (!this.engram.smt.key) {
      throw "no storage key specified";
    }

    try {
      return new this.StorageResults('invalid');
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {

    try {
      let url = this.options.url || this.engram.smt.schema || '';
      if (pattern) {
        // querystring parameters
        // url += ???
      }
      
      let request = {
        method: this.options.method || "GET",
        origin: this.options.origin || this.smt.locus,
        headers: Object.assign({ 'Accept': 'application/json', 'User-Agent': '@dictadata.org/storage' }, this.options.headers),
        timeout: this.options.timeout || 10000
      };
      if (this.options.auth)
        request["auth"] = this.options.auth;

      let response = await httpRequest(url, request);

      let data;
      if (encoder.isContentJSON(response.headers["content-type"]))
        data = JSON.parse(response.data);
      else
        data = response.data;

      let constructs = [];
      encoder.parseData(data, this.options, (construct) => {
        constructs.push(construct);
      });

      return new StorageResults((constructs.length > 0) ? 'ok' : "not found", constructs);
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
    try {
      if (this.engram.smt.key) {
        // delete construct by key
      }
      else {
        // delete all constructs in the .schema
      }

      return new this.StorageResults('invalid');
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

};

// define module exports
TransportJunction.encoder = encoder;
module.exports = TransportJunction;
