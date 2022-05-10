"use strict";

const { StorageReader } = require('../storage-junction');
const { logger } = require('../../utils');

const path = require('path');


module.exports = exports = class ParquetReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    // check schema's extension
    if (this.options.schema && path.extname(this.options.schema) === '')
      this.options.schema = this.options.schema + '.parquet';

    var reader = this;
    var encoding = this.engram;
    var encoder = this.junction.getEncoder();

    /***** create the parser *****/

    function cast(construct) {

      for (let [ name, value ] of Object.entries(construct)) {
        let field = encoding.find(name);
        let newValue = value;

        if (value === null) {
          newValue = field.defaultValue;
        }
        else if (field.type === 'integer') {
          newValue = Number.parseInt(value, 10);
          if (Number.isNaN(newValue)) newValue = field.defaultValue;
        }
        else if (field.type === 'float') {
          newValue = Number.parseFloat(value);
          if (!Number.isFinite(newValue)) newValue = field.defaultValue;
        }
        else if (field.type === 'date') {
          newValue = new Date(value);
          if (isNaN(newValue)) newValue = field.defaultValue;
        }
        else if (field.type === 'keyword') {
          if (value === null) newValue = field.defaultValue;
        }
        else if (field.type === 'text') {
          if (value === null) newValue = field.defaultValue;
        }

        if (newValue !== value)
          construct[ name ] = newValue;
      }

      return construct;
    }

    let parser = null;
    if (this.engram.smt.model === 'Parquets' || this.engram.smt.model === 'Parquetl')
      parser = this.parser = StreamValues.withParser();
    else if (this.engram.smt.model === 'Parqueto')
      parser = this.parser = StreamObject.withParser();
    else  // default Parquet array
      parser = this.parser = StreamArray.withParser();

    var statistics = this._statistics;
    var max = this.options.max_read || -1;

    // eslint-disable-next-line arrow-parens
    parser.on('data', (data) => {
      if (data.value) {
        let construct = encoder.cast(data.value);
        construct = encoder.filter();
        construct = encoder.select(construct);
        //logger.debug(JSON.stringify(data.value));

        if (construct && !reader.push(construct))
          parser.pause();  // If push() returns false stop reading from source.

        if (statistics.count % 1000 === 0)
          logger.verbose(statistics.count);
        if (max >= 0 && statistics.count >= max) {
          reader.push(null);
          parser.destroy();
        }
      }
    });

    parser.on('end', () => {
      reader.push(null);
    });

    parser.on('error', function (err) {
      logger.error(err);
    });

    this.started = false;
  }

  /**
   * An internal call to fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(_size) {
    logger.debug('ParquetReader _read');

    if (!this.started) {
      // start the reader
      let stfs = await this.junction.getFileSystem();
      var rs = await stfs.createReadStream(this.options);
      rs.on("error",
        (err) => {
          this.destroy(err);
        }
      );
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
