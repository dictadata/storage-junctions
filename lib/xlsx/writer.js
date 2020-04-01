/**
 * xlsx/writer
 */
"use strict";

const StorageWriter = require("../junction/writer");
const { StorageError } = require("../types");
const logger = require("../logger");

const XLSX = require('xlsx');
const XlsxSheets = require('./xlsx-sheets');

module.exports = exports = class XlsxWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    // json_to_sheet write options:
    //  "cellDates", "origin", "header", "dateNF", "skipHeader"
    let worksheetDefaults = {
      cellDates: true
    };

    this.workbook = storageJunction.workbook;
    this.sheetName = (options.xlsx && options.xlsx.sheetName) || this.engram.smt.schema || "Sheet1";
    this.worksheetOptions = Object.assign(worksheetDefaults, (options.xlsx && options.xlsx.sheet));
    this.constructs = [];
  }

  async _write(construct, encoding, callback) {
    logger.debug("XlsxWriter _write");
    logger.debug(JSON.stringify(construct));

    try {
      // collect constructs in memory
      this.constructs.push(construct);

      callback();
    }
    catch (err) {
      logger.error(err);
      callback(err);
    }

  }

  async _writev(chunks, callback) {
    logger.debug("XlsxWriter _writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        //let encoding = chunks[i].encoding;  // string encoding

        // collect constructs in memory
        this.constructs.push(construct);
      }
      callback();
    }
    catch (err) {
      logger.error(err);
      callback(err);
    }
  }

  _final(callback) {
    try {
      // create new sheet
      var worksheet = XlsxSheets.json_to_sheet(this.constructs, this.worksheetOptions);

      if (this.workbook.SheetNames.indexOf(this.sheetName) >= 0)
        this.workbook.Sheets[this.sheetName] = worksheet;
      else
        XLSX.utils.book_append_sheet(this.workbook, worksheet, this.sheetName);

      // cleanup resources
      this.constructs = [];
    }
    catch(err) {
      logger.error(err);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error storing construct'));
    }
    callback();
  }

};
