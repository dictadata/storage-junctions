"use strict";

const StorageReader = require('../junction/reader');
const StreamArray = require('stream-json/streamers/StreamArray');
const fs = require('fs');
const logger = require('../logger');

module.exports = class JsonReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    this.filename = this._options.filename || this._junction.filename || '';

    let reader = this;
    var encoding = this._engram;
    var names = Object.keys(this._engram.fields);

    /***** create the parser *****/

    function cast(construct) {

      for (let [name,value] of Object.entries(construct)) {
        let field = encoding.find(name);
        let newValue = value;

        if (field.type === 'integer') {
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

        if (newValue !== value)
          construct[name] = newValue;
      }

      return construct;
    }

    let parseOptions = {
    };
    if (this._options && this._options.max_read)
      parseOptions.to = this._options.max_read;

    let parser = this.parser = StreamArray.withParser();

    // eslint-disable-next-line arrow-parens
    parser.on('data', (data) => {
      if (data.value) {
        logger.debug(data.value);
        let c = cast(data.value);
        if (data.value && !reader.push(c))
          parser.pause();  // If push() returns false stop reading from source.
      }
    });

    parser.on('end', () => {
      reader.push(null);
    });

    parser.on('error', function(err) {
      logger.error(err.message);
    });

    /***** create the file reader *****/

    this.frs = fs.createReadStream(this.filename);
    this.started = false;
  }

  /**
   * An internal call to fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  _read(_size) {
    logger.debug('JsonReader _read');

    if (!this.started) {
      // start the reader
      this.frs.pipe(this.parser);
      this.started = true;
    }
    else if (this.parser.isPaused()) {
      // resume reading
      this.parser.resume();
    }
  }

};
