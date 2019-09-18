"use strict";

const StorageReader = require('../junction/reader');
const CsvParse = require('csv-parse');
const fs = require('fs');
const ynBoolean = require('yn');

module.exports = class CsvReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    this.filename = options && options.filename || '';

    let reader = this;
    let encoding = this._junction._encoding;

    function onCast(value,context) {
      let newValue = value;

      if (context.lines > 1 && context.index < encoding.fields.length) {
        let field = encoding.fields[context.index];

        if (field.type === 'boolean') {
          newValue = ynBoolean(value);
          if (newValue === null) newValue = field.default;
        }
        else if (field.type === 'integer') {
          newValue = Number.parseInt(value,10);
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
        //console.log("cast skip", context.lines, context.index);
      }

      return newValue;
    }

    let parseOptions = {
      delimiter: this._options && this._options.delimiter || ",",
      quote: this._options && this._options.quote || '"',
      columns: true,
      trim: true,
      info: true,
      raw: true,
      cast_date: false,
      cast: this._options && this._options.codify || onCast,
    };
    if (this._options && this._options.max_read)
      parseOptions.to = this._options.max_read;
    let parser = this.parser = new CsvParse(parseOptions);

    parser.on('readable', function(){
      let data;
      // eslint-disable-next-line no-cond-assign
      while (data = parser.read()) {
        if (data.record) {
          //console.log(data.record);
          if (data.record && !reader.push(data.record))
            parser.pause();  // If push() returns false stop reading from source.
        }
      }
    });

    parser.on('end', function() {
      reader.push(null);
    });

    parser.on('error', function(err) {
      console.error(err.message);
    });

    this.frs = fs.createReadStream(this.filename);
    this.started = false;
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  _read(size) {
    //console.log('CsvReader _read');

    if (!this.started) {
      this.frs.pipe(this.parser);
      this.started = true;
    }
    else if (this.parser.isPaused())
      this.parser.resume();
  }

};
