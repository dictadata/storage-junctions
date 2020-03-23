"use strict";

const StorageReader = require('../junction/reader');
const logger = require('../logger');

const Cortex = require('../cortex');
const CsvParse = require('csv-parse');
const ynBoolean = require('yn');

module.exports = exports = class CsvReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    var reader = this;
    var encoding = this.engram;  // module scope
    var names = Object.keys(encoding.fields);

    function onCast(value, context) {
      let newValue = value;

      if (context.lines > 1 && context.index < names.length) {
        let field = encoding.fields[names[context.index]];

        if (field.type === 'boolean') {
          newValue = ynBoolean(value);
          if (typeof newValue === "undefined") newValue = field.default;
        }
        else if (field.type === 'integer') {
          newValue = Number.parseInt(value, 10);
          if (Number.isNaN(newValue)) newValue = field.default;
        }
        else if (field.type === 'float') {
          newValue = Number.parseFloat(value);
          if (!Number.isFinite(newValue)) newValue = field.default;
        }
        else if (field.type === 'date') {
          newValue = new Date(value);
          if (isNaN(newValue)) newValue = field.default;
        }
        else if (field.type === 'keyword') {
          if (value === null) newValue = field.default;
        }
        else if (field.type === 'text') {
          if (value === null) newValue = field.default;
        }
      } else {
        logger.debug("cast skip", context.lines, context.index);
      }

      return newValue;
    }

    let parseOptions = {
      delimiter: this.options && this.options.delimiter || ",",
      quote: this.options && this.options.quote || '"',
      columns: true,
      trim: true,
      info: true,
      raw: true,
      cast_date: false,
      cast: this.options && this.options.codify || onCast,
    };

    if (this.options && this.options.max_read)
      parseOptions.to = this.options.max_read;
    let parser = this.parser = new CsvParse(parseOptions);

    parser.on('readable', function () {
      let data;
      // eslint-disable-next-line no-cond-assign
      while (data = parser.read()) {
        if (data.record) {
          logger.debug(JSON.stringify(data.record));
          if (data.record && !reader.push(data.record))
            parser.pause();  // If push() returns false stop reading from source.
        }
      }
    });

    parser.on('end', function () {
      reader.push(null);
    });

    parser.on('error', function (err) {
      logger.error(err.message);
    });

    this.started = false;
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(size) {
    logger.debug('CsvReader _read');

    if (!this.started) {
      let fst = Cortex.activateFS(this.engram.smt, this.options);
      var rs = await fst.createReadStream();
      rs.pipe(this.parser);
      this.started = true;
    }
    else if (this.parser.isPaused())
      this.parser.resume();
  }

};
