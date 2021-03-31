/**
 * mssql/junction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const { Engram, StorageResults, StorageError } = require("../../types");
const { typeOf } = require("../../utils");
const logger = require('../../logger');

const MSSQLReader = require("./mssql-reader");
const MSSQLWriter = require("./mssql-writer");
const encoder = require("./mssql-encoder");
const sqlEncoder = require("./mssql-encoder-sql");

const tedious = require('tedious');
const util = require('util');

class MSSQLJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'mssql|server=address;userName=name;password=xyz;database=dbname;...|table|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("MSSQLJunction");

    this._readerClass = MSSQLReader;
    this._writerClass = MSSQLWriter;

    // parse database connection string into options
    let pairs = this.smt.locus.split(';');
    for (let i = 0; i < pairs.length; i++) {
      let kv = pairs[i].split('=');

      // constructor options take precedence
      if (!this.options[kv[0]])  
        this.options[kv[0]] = kv[1];
    }

    if (this.options.stringBreakpoints)
      Object.assign(encoder.stringBreakpoints, this.options.stringBreakpoints);
    
    this.connection = null;
  }

  async activate() {
    return new Promise(async (resolve, reject) => {
      logger.debug("MSSQLJunction.activate");

      let options = this.options;
      var config = sqlEncoder.connectionConfig(this.options);
      this.connection = new tedious.Connection(config);

      this.connection.connect(async (err) => {
        if (err) {
          logger.error(err);
          reject(err);
        } else {
          this._isActive = true;
          if (options.bulkLoad) {
            this.connection.beginTransaction((err) => {
              if (err) {
                logger.error(err);
                reject(err);
              }
              else
                resolve();
            })            
          }
          else
            resolve();
        }
      });

      this.connection.on('connect', async (err) => {
        if (err) {
          logger.error(err);
        } else {
          this._isActive = true;
        }
      });

      // general connection error handler
      this.connection.on('error', (err) => {
        if (err) {
          logger.error(err);
        }
      });
    });
  }

  // release any resources
  async relax() {
    return new Promise(async (resolve, reject) => {
      logger.debug("MSSQLJunction.relax");

      this.connection.on('end', () => {
        this._isActive = false;
        resolve();
      });

      if (this.options.bulkLoad) {
        await this._commit();
      }
    
      this.connection.close();
    });
  }

  async _commit() {
    return new Promise((resolve, reject) => {
      this.connection.commitTransaction((err) => {
        if (err) {
          logger.error(err);
          reject(err);
        }
        else
          resolve();
      }) 
    });
  }
      
  async _request(sql, onData) {
    return new Promise((resolve, reject) => {
      let request = new tedious.Request(sql, (err, rowCount) => {
        if (err) {
          reject(err);
        } else {
          resolve(rowCount);
        }
      });

      request.on('row', (row) => {
        if (onData) onData(row);
      });

      this.connection.execSql(request);
    });
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
    logger.debug('MSSQLJunction.list');

    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let list = [];

    try {
      let rx = '^' + schema + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      // fetch encoding form storage source
      let sql = "SELECT [name], [type], create_date, modify_date FROM sys.objects WHERE type = 'U' AND is_ms_shipped = 0";
      await this._request(sql, (row) => {
        let tblname = row["name"].value;
        if (rx.test(tblname))
          list.push(tblname);
      });
      return new StorageResults(0, null, list);
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
    logger.debug("MSSQLJunction.get encoding");

    try {
      // fetch encoding form storage source
      let sql = sqlEncoder.sqlDescribeTable(this.smt.schema);
      await this._request(sql, (column) => {
        let field = encoder.storageField(column);
        this.engram.add(field);
      });

      // fetch the indexes
      sql = sqlEncoder.sqlDescribeIndexes(this.smt.schema);
      await this._request(sql, (column) => {
        sqlEncoder.decodeIndexResults(this.engram, column);
      });
      
      return new StorageResults(0, null, this.engram.encoding, "encoding");
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async createSchema(options={}) {
    logger.debug("MSSQLJunction.createSchema");

    try {
      let encoding = options.encoding || this.engram.encoding;
      
      // check if table already exists
      let { data: tables } = await this.list();
      if (tables.length > 0) {
        return new StorageResults(409, 'table exists');
      }

      // use temporary engram
      let engram = new Engram(this.engram.smt);
      engram.encoding = encoding;

      // create table on source
      let sql = sqlEncoder.sqlCreateTable(engram, this.options);
      logger.verbose(sql);
      await this._request(sql, null);

      // if successfull update engram
      this.engram.encoding = encoding;      
      return new StorageResults(0);
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
    logger.debug('MSSQLJunction dullSchema');
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    
    try {
      let sql = "DROP TABLE " + schema;
      await this._request(sql);
      return new StorageResults(0);
    }
    catch (err) {
      if (err.number === 3701)
        return new StorageResults(404, "table not found");
      
      logger.error(err.number, err.message);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern) {
    logger.debug("MSSQLJunction.store");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError( 400, "unique keys not supported");
    if (typeOf(construct) !== "object")
      throw new StorageError( 400, "Invalid parameter: construct is not an object");

    try {
      if (!this.engram.isDefined) {
        let results = await this.getEncoding();
        logger.debug(JSON.stringify(results));
      }

      // INSERT/UPDATE logic
      let rowCount = 0;
      let sql = sqlEncoder.sqlInsert(this.engram, construct);
      logger.debug(sql);
      try {
        rowCount = await this._request(sql, null);
      }
      catch (err) {
        if (err.number !== 2627)  // violation of primary key constraint
          throw err;
      }

      if (rowCount === 0 && this.engram.keys.length > 0 && this.engram.keys.length < this.engram.fieldsLength) {
        let sql = sqlEncoder.sqlUpdate(this.engram, construct);
        logger.debug(sql);
        rowCount = await this._request(sql, null);
      }

      return new StorageResults(0, null, rowCount, "rowCount");
    }
    catch (err) {
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
    logger.debug("MSSQLJunction storeBulk");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError( 400, "unique keys not supported");
    if (typeOf(constructs) !== "array")
      throw new StorageError( 400, "Invalid parameter: construct is not an object");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let sql = sqlEncoder.sqlBulkInsert(this.engram, constructs);
      logger.debug(sql);
      let rowCount = await this._request(sql, null);

      // check if rows were inserted
      return new StorageResults(0, null, rowCount, "rowCount");
    }
    catch (err) {
      if (err.number === 2627)
        return new StorageResults(err.number, err.message);
      
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   *
   */
  async recall(pattern) {
    logger.debug("MSSQLJunction.recall");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError( 400, "unique keys not supported");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let resultRow = null;
      let sql = "SELECT * FROM " + this.smt.schema + sqlEncoder.sqlWhereByKey(this.engram, pattern);
      logger.verbose(sql);
      let engram = this.engram;
      let rowCount = await this._request(sql, (row) => {
        resultRow = sqlEncoder.decodeResults(engram, row);
      });
      
      logger.debug(rowCount + ' rows');
      let resultCode = rowCount > 0 ? 200 : 404;
      return new StorageResults(resultCode, null, resultRow);
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
    logger.debug("MSSQLJunction retrieve");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let resultRows = [];
      let sql = sqlEncoder.sqlSelectByPattern(this.engram, pattern);
      logger.verbose(sql);
      let engram = this.engram;
      let rowCount = await this._request(sql, (row) => {
        let construct = sqlEncoder.decodeResults(engram, row);
        resultRows.push( construct );
      });
        
      logger.debug(rowCount + ' rows');
      let resultCode = resultRows.length > 0 ? 200 : 404;
      return new StorageResults(resultCode, null, resultRows);
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
    logger.debug("MSSQLJunction dull");
    if (!pattern) pattern = {};

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError( 400, "unique keys not supported");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let sql = '';
      if (this.engram.keyof === 'primary') {
        // delete construct by ID
        sql = "DELETE FROM " + this.smt.schema + sqlEncoder.sqlWhereByKey(this.engram, pattern);
      }
      else {
        // delete all constructs in the .schema
        sql = "TRUNCATE TABLE " + this.smt.schema;
      }
      logger.verbose(sql);

      let rowCount = await this._request(sql, null);
      return new StorageResults(0, null, rowCount, "rowCount");
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

}

// define module exports
MSSQLJunction.encoder = encoder;
MSSQLJunction.sqlEncoder = sqlEncoder;
module.exports = MSSQLJunction;
