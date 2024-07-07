"use strict";

const { StorageReader } = require('../storage-junction');
const { StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');

const chain = require('stream-chain');
const CsvParser = require('stream-csv-as-json');
const CsvAsObjects = require('./csv-AsObjects'); //require('stream-csv-as-json/AsObjects');
const StreamValues = require('stream-json/streamers/StreamValues');


module.exports = exports = class CSVReader extends StorageReader {

  /**
   *
   * @param {object}   junction parent CSVJunction
   * @param {object}   options
   * @param {boolean}  options.header input includes a header row, default false
   * @param {string[]} options.headers values to use for headers instead of engram field names, default undefined
   * @param {string}   options.separator field separator value, default ','
   * @param {number}   options.count maximum number of rows to read, default all
   * @param {string}   options.fileEncoding  default "utf8"
   */
  constructor(junction, options) {
    super(junction, options);

    // check schema's extension
    //if (this.options.schema && path.extname(this.options.schema) === '')
    //  this.options.schema = this.options.schema + '.csv';

    // this.options.header = false;  // default value

    /***** create the csvchain and data handlers *****/
    var reader = this;
    var encoder = this.junction.createEncoder(options);

    var stats = this._stats;
    var count = this.options?.pattern?.count || this.options?.count || -1;

    if (!options.header && !options.keys && !options.headers)
      options.headers = this.engram.names;

    var parser = CsvParser({ separator: options.separator });

    let pipes = [];
    pipes.push(parser);

    if (!this.options.raw) {
      pipes.push(new CsvAsObjects({
        keys: options.keys || options.headers,
        header: options.header
      }));
    }

    pipes.push(new StreamValues());

    var csvchain = this.csvchain = new chain(pipes);

    // eslint-disable-next-line arrow-parens
    csvchain.on('data', (data) => {
      if (data.value) {
        let construct = data.value;
        if (!this.options.raw) {
          construct = encoder.cast(construct);
          construct = encoder.filter(construct);
          construct = encoder.select(construct);
        }
        //logger.debug(JSON.stringify(construct));

        if ((stats.count + 1) % 10000 === 0) {
          logger.verbose(stats.count + " " + stats.interval + "ms");
        }

        if (count > 0 && stats.count > count) {
          reader.push(null);
          csvchain.destroy();
        }
        else if (construct) {
          reader._stats.count += 1;
          if (!reader.push(construct))
            csvchain.pause();  // If push() returns false stop reading from source.
        }
      }
    });

    csvchain.on('end', () => {
      reader.push(null);
    });

    csvchain.on('error', function (err) {
      let sterr = reader.junction.StorageError(err);
      logger.warn(sterr);
      //throw sterr;
    });

    this.stfs;
  }

  async _construct(callback) {
    logger.debug("CSVReader._construct");

    try {
      // start the reader
      let rs;
      try {
        this.stfs = await this.junction.getFileSystem();
        rs = await this.stfs.createReadStream(this.options);
        rs.setEncoding(this.options.fileEncoding || "utf8");
        rs.on('error',
          (err) => {
            logger.warn(`CSVReader parser error: ${err.message}`);
            this.destroy(this.stfs?.StorageError(err) ?? new StorageError(err));
          }
        );
        rs.pipe(this.csvchain);
      }
      catch (err) {
        logger.warn(`CSVReader read error: ${err.message}`);
        this.destroy(this.stfs?.StorageError(err) ?? new StorageError(err));
      }

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) || new StorageError('CSVReader construct error'));
    }
  }

  /**
   * An internal call to fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(_size) {
    logger.debug('CSVReader _read');

    try {
      if (this.csvchain.isPaused()) {
        // resume reading
        this.csvchain.resume();
      }
      else if (this.csvchain.destroyed || !this.csvchain.readable)
        this.push(null);
    }
    catch (err) {
      logger.debug("CSVReader read error: " + err.message);
      this.destroy(err);
    }
  }

};
