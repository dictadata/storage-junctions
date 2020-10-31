/**
 * xlsx/junction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResults, StorageError } = require("../types");
const Engram = require("../engram");
const logger = require('../logger');

const XlsxReader = require("./reader");
const XlsxWriter = require("./writer");
const encoder = require("./encoder");

const XLSX = require('xlsx');
const XlsxSheets = require('./xlsx-sheets');

const fs = require('fs/promises');
const stream = require('stream');


module.exports = exports = class XlsxJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'xlsx|file:filepath|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("XlsxJunction");

    this._readerClass = XlsxReader;
    this._writerClass = XlsxWriter;

    this.filepath = this.smt.locus;
    this.workbook = null;
    this.wbModified = false;

    this.sheetName = this.options.sheetName || this.engram.smt.schema || "Sheet1";

    // read workbook options:
    //   "cellFormula", "cellHTML", "cellNF", "cellStyles", "cellText", "cellDates"
    if (this.options.cells)
      this.options.readFile = Object.assign({ cellDates: true, cellNF: true, cellStyles: true }, this.options.readFile);
    else
      this.options.readFile = Object.assign({ cellDates: true }, this.options.readFile);

    // write workbook options:
    //   "cellDates", "type", "bookSST", "bookType", "sheet", "compression", "Props", "themeXLSX", "ignoreEC"
    if (this.options.cells)
      this.options.writeFile = Object.assign({ cellDates: true, cellNF: true, cellStyles: true }, this.options.writeFile);
    else
      this.options.writeFile = Object.assign({ cellDates: true }, this.options.writeFile);

    // sheet_to_jason read options:
    // "raw", "range", "header", "dateNF", "defval", "blankrows"
    this.options.sheet_to_json = Object.assign({}, this.options.sheet_to_json);

    // json_to_sheet write options:
    //  "cellDates", "origin", "header", "dateNF", "skipHeader"
    this.options.json_to_sheet = Object.assign({ cellDates: true }, this.options.json_to_sheet);
  }

  // initialize workbook
  async activate() {
    super.activate();

    if (fs.existsSync(this.filepath) && !this.options.overwrite) {
      logger.debug("load workbook " + this.filepath);
      this.workbook = XLSX.readFile(this.filepath, this.options.readFile);
    }
    else {
      logger.debug("new workbook");
      this.workbook = XLSX.utils.book_new();
    }
  }

  async relax() {
    logger.debug("XlsxJunction relax");

    // save file
    if (this.wbModified) {
      logger.debug("save workbook");
      XLSX.writeFile(this.workbook, this.filepath, this.options.writeFile);
    }
  }

  /**
  * Return list of sheet names found in the workbook.
  * The smt.schema or options.schema should contain a wildcard character *.
  * If options.forEach is defined it is called for each schema found.
  * Returns list of schemas found.
  * @param {*} options - list options
  */
  async list(options) {
    logger.debug('XlsxJunction list');
    options = Object.assign({}, options, this.options);

    let match = options.schema || this.smt.schema || '*';
    let rx = '^' + match + '$';
    rx = rx.replace('.', '\\.');
    rx = rx.replace('*', '.*');
    rx = new RegExp(rx);

    let list = [];
    for (let sheetName of this.workbook.SheetNames) {
      if (rx.test(sheetName)) {
        if (options.forEach)
          await options.forEach(sheetName);

        list.push(sheetName);
      }
    }
    return list;
  }

  /**
     *  Get the encoding for the storage node.
     *  Possibly make a call to the source to acquire the encoding definitions.
     */
  async getEncoding() {
    logger.debug("XlsxJunction getEncoding");

    try {
      // fetch encoding form storage source
      if (!this.engram.defined) {
        // read some rows from sheet to infer data types
        // could possibly read types from sheet,
        // but individual cells can have formats that differ from others in the column
        let reader = this.getReadStream(this.options || { max_read: 100 });
        let codify = this.getTransform('codify', this.options || {});

        await stream.pipeline(reader, codify);
        let encoding = await codify.getEncoding();
        this.engram.replace(encoding);
      }
      return this.engram;
    }
    catch (err) {
      if (err)
        return 'error result';

      logger.error(err);
      throw err;
    }
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async putEncoding(encoding) {
    logger.debug("XlsxJunction putEncoding");

    try {
      // possible steps
      // create sheet, if needed
      // write column headings

      this.engram.replace(encoding);
      return this.engram;
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, options) {
    logger.debug("XlsxJunction store");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");
    if (typeof construct !== "object")
      throw new StorageError({ statusCode: 400 }, "Invalid parameter: construct is not an object");

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      // find row in sheet or append row
      let found = false;
      // update row

      // check if row was inserted
      return new StorageResults((found) ? "ok" : "not found");
    }
    catch (err) {
      if (err) {
        return new StorageResults('error', null, null, err);
      }

      logger.error(err);
      throw err;
    }
  }

  /**
   *
   */
  async recall(options) {
    logger.debug("XlsxJunction recall");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      // find row in sheet
      // build the construct
      let found = false;
      let construct = {};

      return new StorageResults((found) ? "ok" : "not found", construct);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   * @param {*} options options.pattern
   */
  async retrieve(options) {
    logger.debug("XlsxJunction retrieve");
    let pattern = options && (options.pattern || options || {});

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let constructs = [];
      // scan rows in sheet
      // if match add to constructs

      return new StorageResults((constructs.length > 0) ? "ok" : "not found", constructs);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   */
  async dull(options) {
    logger.debug("XlsxJunction dull");
    if (!options) options = {};

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let results = null;
      if (this.engram.keyof === 'list' || this.engram.keyof === 'all') {
        // delete rows in sheet that match pattern

      }
      else {
        // delete all rows in the sheet

      }

      return new StorageResults((results.count > 0) ? "ok" : "not found", null, null, results);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

};
