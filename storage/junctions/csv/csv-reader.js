"use strict";

const { StorageReader } = require('../storage-junction');
const { StorageError } = require('../../types');
const { logger } = require('../../utils');

const chain = require('stream-chain');
const CsvParser = require('stream-csv-as-json');
const CsvAsObjects = require('./csv-AsObjects'); //require('stream-csv-as-json/AsObjects');
const StreamValues = require('stream-json/streamers/StreamValues');


module.exports = exports = class CSVReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    // check schema's extension
    //if (this.options.schema && path.extname(this.options.schema) === '')
    //  this.options.schema = this.options.schema + '.csv';

    // this.options.header = false;  // default value

    /***** create the pipeline and data handlers *****/
    var reader = this;
    var encoding = this.engram;
    this.started = false;
    var encoder = this.junction.createEncoder(options);

    var statistics = this._statistics;
    var max = this.options.max_read || -1;

    var parser = CsvParser({ separator: options.separator });
    var pipeline = this.pipeline = new chain([
      parser,
      new CsvAsObjects({
        keys: options.keys || options.headers || encoding.names,
        header: options.header
      }),
      new StreamValues()
    ]);

    // eslint-disable-next-line arrow-parens
    pipeline.on('data', (data) => {
      if (data.value) {
        let construct = encoder.cast(data.value);
        construct = encoder.filter(construct);
        construct = encoder.select(construct);
        //logger.debug(JSON.stringify(construct));

        if (statistics.count % 1000 === 0)
          logger.debug(statistics.count);

        if (max >= 0 && statistics.count >= max) {
          reader.push(null);
          pipeline.destroy();
        }
        else if (construct && !reader.push(construct)) {
          //pipeline.pause();  // If push() returns false stop reading from source.
        }

      }

    });

    pipeline.on('end', () => {
      reader.push(null);
    });

    pipeline.on('error', function (err) {
      logger.error(err);
      // throw err;
    });

    this.stfs;
  }

  /**
   * An internal call to fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(_size) {
    logger.debug('CSVReader _read');

    if (!this.started) {
      // start the reader
      let rs;
      try {
        this.stfs = await this.junction.getFileSystem();
        rs = await this.stfs.createReadStream(this.options);
        rs.setEncoding(this.options.fileEncoding || "utf8");
        rs.on('error',
          (err) => {
            logger.error(`CSVReader parser error: ${err.message}`);
            this.destroy(this.stfs?.Error(err) ?? err);
          }
        );
        rs.pipe(this.pipeline);
        this.started = true;
      }
      catch (err) {
        logger.error(`CSVReader read error: ${err.message}`);
        this.destroy(this.stfs?.Error(err) ?? err);
      }
    }
    else if (this.pipeline.isPaused()) {
      // resume reading
      this.pipeline.resume();
    }
    else if (this.pipeline.destroyed || !this.pipeline.readable)
      this.push(null);
  }

};
