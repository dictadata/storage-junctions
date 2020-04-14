/**
 * xlsx/reader
 */
"use strict";

const StorageReader = require("../junction/reader");
const { StorageError } = require("../types");
const logger = require("../logger");

const XLSX = require('xlsx');
const XlsxSheets = require('./xlsx-sheets');

module.exports = exports = class XlsxReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    // set capabilities of the StorageReader
    this.useTransforms = true;  // the data source doesn't support queries, so use the base junction will use Transforms to filter and select

    // sheet_to_jason read options:
    // "raw", "range", "header", "dateNF", "defval", "blankrows"
    let worksheetDefaults = {};

    this.workbook = storageJunction.workbook;
    this.sheetName = (options.xlsx && options.xlsx.sheetName) || this.engram.smt.schema || "Sheet1";
    this.worksheetOptions = Object.assign(worksheetDefaults, (options.xlsx && options.xlsx.sheet));
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    logger.debug('XlsxReader _read');
    let options = this.options;

    // suggested to read up to size constructs
    // we'll ignore and push all rows from sheet
    try {
      var worksheet = this.workbook.Sheets[this.sheetName];
      if (!worksheet)
        throw(new StorageError({StatusCode: 404, message: "sheet not found"}));

      let constructs = XlsxSheets.sheet_to_json(worksheet, this.worksheetOptions);

      var max = options.max_read ? Math.min(options.max_read, constructs.length) : constructs.length;
      for (let i = 0; i < max; i++)
        this.push(constructs[i]);

      // when done reading from source
      this.push(null);
    }
    catch (err) {
      logger.error(err);
      this.push(null);
    }

  }

};
