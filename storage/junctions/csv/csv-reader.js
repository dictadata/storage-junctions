"use strict";

const Storage = require('../../storage');
const { StorageReader } = require('../storage-junction');
const { StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');

const CsvParser = require('stream-csv-as-json');
const CsvAsObjects = require('./csv-AsObjects'); //require('stream-csv-as-json/AsObjects');
const StreamValues = require('stream-json/streamers/StreamValues');
const chain = require('stream-chain');

module.exports = exports = class CSVReader extends StorageReader {

  /**
   *
   * @param {object}   junction parent CSVJunction
   * @param {object}   options
   * @param {boolean}  options.hasHeader input includes a header row, default false
   * @param {string[]} options.headers names to override header row, if encoding provided then engram field names, default []
   * @param {string}   options.separator field separator value, default ','
   * @param {number}   options.count maximum number of rows to read, default all
   * @param {string}   options.fileEncoding  default "utf8"
   * @param {boolean}  options.raw output raw data as arrays
   */
  constructor(junction, options) {
    super(junction, options);

    // check schema's extension
    //if (this.options.schema && path.extname(this.options.schema) === '')
    //  this.options.schema = this.options.schema + '.csv';

    if (!options.raw && !options.headers && options.encoding)
      this.options.headers = this.engram.names;

    this.started = false;
    this.rs;
  }

  async _construct(callback) {
    logger.debug("CSVReader._construct");

    try {
      const reader = this;
      const count = this.options?.pattern?.count || this.options?.count || -1;
      const _stats = this._stats;

      const encoder = this.junction.createEncoder(this.options);
      const parser = this.parser = CsvParser({ separator: this.options.separator });

      const pipes = [];
      pipes.push(parser);
      if (!this.options.raw)
        pipes.push(new CsvAsObjects(this.options));
      pipes.push(new StreamValues());

      const pipeline = this.pipeline = new chain(pipes);

      // eslint-disable-next-line arrow-parens
      pipeline.on('data', async (data) => {
        logger.debug("pipeline on data");

        if (data.value) {
          let construct = data.value;
          if (!this.options.raw) {
            construct = encoder.cast(construct);
            construct = encoder.filter(construct);
            construct = encoder.select(construct);
          }
          //logger.debug(JSON.stringify(construct));
          if (!construct)
            return;

          await this.output(construct);

          if (count > 0 && _stats.count >= count) {
            reader.push(null);
            reader.rs.destroy();
          }
        }
      });

      pipeline.on('end', () => {
        logger.debug("pipeline on end");
        reader.push(null);
      });

      pipeline.on('error', function (err) {
        let sterr = reader.junction.StorageError(err);
        logger.warn(sterr);
      });

      // create the read stream
      this.stfs = await this.junction.getFileSystem();
      this.rs = await this.stfs.createReadStream(this.options);
      this.rs.setEncoding(this.options.fileEncoding || "utf8");

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) || new StorageError('CSVReader construct error'));
    }
  }

  /**
   * waiting on output helps with node micro-tasking
   * @param {*} construct
   */
  async output(construct) {

    this._stats.count += 1;
    if (!this.push(construct)) {
      this.parser.pause();  // If push() returns false then pause reading from source.
    }

    if (this._stats.count % 100000 === 0)
      logger.verbose(this._stats.count + " " + this._stats.interval + "ms");
  }

  async _destroy(err, callback) {
    callback();
  }

  /**
   * An internal call to fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(_size) {
    logger.debug('CSVReader _read');

    try {
      if (!this.started) {
        this.started = true;
        this.rs.pipe(this.pipeline);
      }
      else {
        // resume reading
        this.parser.resume();
      }
    }
    catch (err) {
      logger.debug("CSVReader read error: " + err.message);
      this.destroy(err);
    }
  }

};
