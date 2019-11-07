"use strict";

const StorageReader = require('../junction/reader');
const Types = require('../types');
const logger = require('../logger');

const fileStreams = require('../lib/fileStreams');
const chain  = require('stream-chain');
const ParserCsv = require('stream-csv-as-json');
const AsObjects = require('stream-csv-as-json/AsObjects');
const StreamValues = require('stream-json/streamers/StreamValues');
const ynBoolean = require('yn');


module.exports = class Csveader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    var reader = this;
    var encoding = this._engram;
    //var names = Object.keys(this._engram.fields);

    /***** create the parser *****/
    this.started = false;

    function cast(construct) {

      for (let [name,value] of Object.entries(construct)) {
        let newValue = value;
        let field = encoding.find(name);

        if (value === "" || value === null) {     // current parser generates "" instead of null
          newValue = field.default;
        }
        else if (field.type === 'boolean') {
          newValue = ynBoolean(value);
          if (newValue === null)
            newValue = field.default;
        }
        else if (field.type === 'integer') {
          newValue = Number.parseInt(value,10);
          if (Number.isNaN(newValue))
            newValue = field.default;
        }
        else if (field.type === 'float') {
          newValue = Number.parseFloat(value);
          if (!Number.isFinite(newValue))
            newValue = field.default;
        }
        else if (field.type === 'date') {
          newValue = new Date(value);
          if (isNaN(newValue))
            newValue = field.default;
        }
        else if (field.type === 'keyword') {
          if (value === null)
            newValue = field.default;
        }
        else if (field.type === 'text') {
          if (value === null)
            newValue = field.default;
        }
        else {
          newValue = Types.parseValue(value);
        }

        if (newValue !== value)
          construct[name] = newValue;
      }

      return construct;
    }

    let parser = this.parser = new chain([
      ParserCsv(),
      new AsObjects(),
      new StreamValues()
    ]);

    var count = 0;
    var max = this._options.max_read || -1;

    // eslint-disable-next-line arrow-parens
    parser.on('data', (data) => {
      if (data.value) {
        let c = cast(data.value);
        logger.debug(JSON.stringify(data.value));
        if (data.value && !reader.push(c))
          parser.pause();  // If push() returns false stop reading from source.

        ++count;
        if (count % 100 === 0)
          logger.verbose(count);
        if (max >= 0 && count >= max) {
          reader.push(null);
          parser.destroy();
        }
      }

    });

    parser.on('end', () => {
      reader.push(null);
    });

    parser.on('error', function(err) {
      logger.error(err.message);
    });

  }

  /**
   * An internal call to fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(_size) {
    logger.debug('CsvReader _read');

    if (!this.started) {
      // start the reader
      var rs = await fileStreams.createReadStream(this._engram.smt, this._options);
      rs.pipe(this.parser);
      this.started = true;
    }
    else if (this.parser.isPaused()) {
      // resume reading
      this.parser.resume();
    }
    else if (this.parser.destroyed || !this.parser.readable)
      this.push(null);
  }

};
