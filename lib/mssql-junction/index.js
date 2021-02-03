/**
 * mssql/junction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const MSSQLReader = require("./reader");
const MSSQLWriter = require("./writer");
const encoder = require("./encoder");
const sqlEncoder = require("./encoder_sql");
const Engram = require("../engram");
const { StorageResults, StorageError } = require("../types");
const logger = require('../logger');

const tedious = require('tedious');
const util = require('util');

module.exports = exports = class MSSQLJunction extends StorageJunction {

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

    this.connection = null;
  }

  async activate() {
    return new Promise(async (resolve, reject) => {
      logger.debug("MSSQLJunction.activate");

      var config = sqlEncoder.connectionConfig(this.options);
      this.connection = new tedious.Connection(config);
      this.connection.connect((err) => {
        if (err) {
          logger.error(err);
          reject(err);
        } else {
          this._isActive = true;
        }
      });

      this.connection.on('connect', (err) => {
        if (err) {
          logger.error(err);
          reject(err);
        } else {
          this._isActive = true;
          resolve();
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
        super.relax();
        resolve();
      });

      this.connection.close();
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
    return new Promise(async (resolve, reject) => {
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
        let request = new tedious.Request(sql, (err, rowCount) => {
          if (err) {
            logger.error(err);
            reject(err);
          } else {
            logger.debug(rowCount + ' rows');
            resolve(list);
          }
        });

        request.on('row', (columns) => {
          let tblname = columns["name"].value;
          if (rx.test(tblname))
            list.push(tblname);
        });

        this.connection.execSql(request);
      }
      catch (err) {
        logger.error(err.statusCode, err.message);
        reject(err);
      }
    });
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    return new Promise(async (resolve, reject) => {
      logger.debug("MSSQLJunction.getEncoding");

      try {
        // fetch encoding form storage source
        let sql = sqlEncoder.sqlDescribeTable(this.smt.schema);
        let request = new tedious.Request(sql, (err, rowCount) => {
          if (err) {
            logger.error(err);
            reject(err);
          } else {
            logger.debug(rowCount + ' rows');
            if (rowCount === 0)
              resolve("not found");
            else
              resolve(this.engram);
          }
        });

        // 
        request.on('row', (columnDef) => {
          let field = encoder.storageField(columnDef);
          this.engram.add(field);
        });

        this.connection.execSql(request);
      }
      catch (err) {
        logger.error(err);
        reject(err);
      }
    });
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async putEncoding(encoding, overlay=false) {
    return new Promise(async (resolve, reject) => {
      logger.debug("MSSQLJunction.putEncoding");

      if (overlay) {
        this.engram.replace(encoding);
        resolve(this.engram);
        return;
      }
      
      try {
        // check if table already exists
        let tables = await this.list();
        if (tables.length > 0) {
          resolve('schema exists');
          return;
        }

        let engram = new Engram(this.engram);
        engram.replace(encoding);
        let sql = sqlEncoder.sqlCreateTable(engram);
        logger.verbose(sql);

        // create table
        let request = new tedious.Request(sql, (err) => {
          if (err) {
            logger.error(err);
            reject(err);
          } else {
            logger.debug('created');
            this.engram.replace(encoding);
            resolve(this.engram);
          }
        });

        this.connection.execSql(request);
      }
      catch (err) {
        logger.error(err);
        reject(err);
      }
    });
  }

  async _request(sql) {
    return new Promise((resolve, reject) => {
      let request = new tedious.Request(sql, (err, rowCount) => {
        if (err) {
          if (err.number === 2627)
            resolve(0);  // duplicate key
          else
            reject(err);
        } else {
          resolve(rowCount);
        }
      });

      this.connection.execSql(request);
    });
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern) {
    logger.debug("MSSQLJunction.store");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");
    if (typeof construct !== "object")
      throw new StorageError({ statusCode: 400 }, "Invalid parameter: construct is not an object");

    try {
      if (Object.keys(this.engram.fields).length == 0) {
        let result = await this.getEncoding();
        logger.debug(result);
      }

      // INSERT/UPDATE logic
      let sql = sqlEncoder.sqlInsert(this.engram, construct);
      logger.verbose(sql);
      let rowCount = await this._request(sql);

      if (rowCount === 0 && this.engram.keys.length > 0) {
        let sql = sqlEncoder.sqlUpdate(this.engram, construct);
        logger.verbose(sql);
        rowCount = await this._request(sql);
      }

      return new StorageResults((rowCount > 0 ? "ok" : "not stored"), null);
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
    return new Promise(async (resolve, reject) => {
      logger.debug("MSSQLJunction.recall");

      if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
        throw new StorageError({ statusCode: 400 }, "unique keys not supported");

      try {
        if (Object.keys(this.engram.fields).length == 0)
          await this.getEncoding();

        let resultRow = null;
        let sql = "SELECT * FROM " + this.smt.schema + sqlEncoder.sqlWhereFromKey(this.engram, pattern);
        logger.verbose(sql);
        let request = new tedious.Request(sql, (err, rowCount) => {
          if (err) {
            logger.error(err);
            reject(err);
          } else {
            logger.debug(rowCount + ' rows');
            resolve(new StorageResults((rowCount > 0 ? "ok" : "not found"), resultRow));
          }
        });

        let engram = this.engram;
        request.on('row', (columns) => {
          resultRow = sqlEncoder.decodeResults(engram, columns);
        });

        this.connection.execSql(request);
      }
      catch (err) {
        logger.error(err);
        reject(err);
      }
    });
  }

  /**
   *
   * @param {*}  pattern
   */
  async retrieve(pattern) {
    return new Promise(async (resolve, reject) => {
      logger.debug("MSSQLJunction retrieve");

      try {
        if (Object.keys(this.engram.fields).length == 0)
          await this.getEncoding();

        let resultRows = [];
        let sql = sqlEncoder.sqlSelectWithPattern(this.engram, pattern);
        logger.verbose(sql);
        let request = new tedious.Request(sql, (err, rowCount) => {
          if (err) {
            logger.error(err);
            reject(err);
          } else {
            logger.debug(rowCount + ' rows');
            resolve(new StorageResults((rowCount > 0 ? "ok" : "not found"), resultRows));
          }
        });

        let engram = this.engram;
        request.on('row', (columns) => {
          let construct = sqlEncoder.decodeResults(engram, columns);
          resultRows.push( construct );
        });

        this.connection.execSql(request);
      }
      catch (err) {
        logger.error(err);
        reject(err);
      }
    });
  }

  /**
   *
   */
  async dull(pattern) {
    logger.debug("MSSQLJunction dull");
    if (!pattern) pattern = {};

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let sql = '';
      if (this.engram.keyof === 'primary' || this.engram.keyof === 'all') {
        // delete construct by ID
        sql = "DELETE FROM " + this.smt.schema + sqlEncoder.sqlWhereFromKey(this.engram, pattern);
      }
      else {
        // delete all constructs in the .schema
        sql = "TRUNCATE " + this.smt.schema + ";";
      }

      let rowCount = await this._request(sql);
      return new StorageResults((rowCount > 0 ? "ok" : "not found"), null);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

}
