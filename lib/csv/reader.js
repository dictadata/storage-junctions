"use strict";

const StorageReader = require('../junction/reader');
const logger = require('../logger');
const CsvParse = require('csv-parse');

const AWS = require("aws-sdk");
const uuid = require('uuid');

const fs = require('fs');
const path = require('path');
const ynBoolean = require('yn');

module.exports = class CsvReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    var reader = this;
    var encoding = this._engram;  // module scope
    var names = Object.keys(encoding.fields);

    function onCast(value, context) {
      let newValue = value;

      if (context.lines > 1 && context.index < names.length) {
        let field = encoding.fields[names[context.index]];

        if (field.type === 'boolean') {
          newValue = ynBoolean(value);
          if (!newValue) newValue = field.default;
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

    parser.on('readable', function () {
      let data;
      // eslint-disable-next-line no-cond-assign
      while (data = parser.read()) {
        if (data.record) {
          logger.debug(data.record);
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
   * createReadStream
   */
  createReadStream() {
    let rs = null;
    if (this._engram.smt.locus.indexOf('S3:') === 0 || this._engram.smt.locus.indexOf('s3:') === 0) {
      var S3 = new AWS.S3({
        apiVersion: '2006-03-01',
        accessKeyId: this._options.aws_accessKeyId || '',
        secretAccessKey: this._options.aws_secretAccessKey || '',
        region: this._options.aws_region || 'us-east-1' });

      var s3params = {
        Bucket: this._engram.smt.locus.substring(3),
        Key: this._engram.smt.schema
      };

      rs = S3.getObject(s3params).createReadStream();
    }
    else {
      // default to local file path or file: URL
      var filename = path.join(this._engram.smt.locus, this._engram.smt.schema) || '';
      rs = fs.createReadStream(filename);
    }
    return rs;
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  _read(size) {
    logger.debug('CsvReader _read');

    if (!this.started) {
      var rs = this.createReadStream();
      rs.pipe(this.parser);
      this.started = true;
    }
    else if (this.parser.isPaused())
      this.parser.resume();
  }

};
