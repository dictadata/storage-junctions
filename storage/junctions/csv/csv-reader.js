"use strict";

const { StorageReader } = require('../storage-junction');
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

    /***** create the parser and data handlers *****/
    var reader = this;
    var encoding = this.engram;
    this.started = false;
    var encoder = this.junction.createEncoder(options);

    var statistics = this._statistics;
    var max = this.options.max_read || -1;

    let parser = this.parser = new chain([
      CsvParser({ separator: options.separator }),
      new CsvAsObjects({ keys: encoding.names, header: options.header }),
      new StreamValues()
    ]);

    // eslint-disable-next-line arrow-parens
    parser.on('data', (data) => {
      if (data.value) {
        let construct = encoder.cast(data.value);
        construct = encoder.filter(construct);
        construct = encoder.select(construct);
        //logger.debug(JSON.stringify(construct));

        if (construct && !reader.push(construct)) {
          //parser.pause();  // If push() returns false stop reading from source.
        }

        if (statistics.count % 1000 === 0)
          logger.debug(statistics.count);
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
      //logger.error(err);
      throw err;
    });

  }

  /**
   * An internal call to fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(_size) {
    logger.debug('CSVReader _read');

    if (!this.started) {
      // start the reader
      let stfs = await this.junction.getFileSystem();
      var rs = await stfs.createReadStream(this.options);
      rs.setEncoding(this.options.fileEncoding || "utf8");
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
