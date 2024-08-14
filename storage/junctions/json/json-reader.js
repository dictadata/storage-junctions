"use strict";

const Storage = require('../../storage');
const { StorageReader } = require('../storage-junction');
const { StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');

const JsonParser = require('stream-json');
const streamValues = require('stream-json/streamers/StreamValues');
const streamArray = require('stream-json/streamers/StreamArray');
const streamObject = require('stream-json/streamers/StreamObject');
const chain = require('stream-chain');
const pick = require('stream-json/filters/Pick');

module.exports = exports = class JSONReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   * @param {boolean}  options.hasHeader input includes a header row, default false
   * @param {string[]} options.headers values to use for field names, default undefined
   * @param {string}   options.pick property name to pick from source object(s)
   * @param {number}   options.count maximum number of rows to read, default all
   * @param {string}   options.fileEncoding  default "utf8"
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    // check schema's extension
    //if (this.options.schema && path.extname(this.options.schema) === '')
    //  this.options.schema = this.options.schema + '.json';

    // headers needed for jsona rows
    if (!options.hasHeader && !options.headers)
      this.options.headers = this.engram.names;

    this.encoder = this.junction.createEncoder(this.options);

    this._headers;
    this.started = false;
  }

  async _construct(callback) {
    logger.debug("JSONReader._construct");

    try {

      /***** create the parser, pipieline and data handlers *****/
      let jstream = (this.engram.smt.model === 'jsons' || this.engram.smt.model === 'jsonl');
      var parser = this.parser = JsonParser({ jsonStreaming: jstream });
      var pipes = [ parser ];

      if (this.options.pick) {
        pipes.push(new pick({ filter: this.options.pick }));
      }

      if (this.engram.smt.model === 'jsons' || this.engram.smt.model === 'jsonl')
        pipes.push(new streamValues());
      else if (this.engram.smt.model === 'jsono')
        pipes.push(new streamObject());
      else  // default json array
        pipes.push(new streamArray());

      // create variables that will be in the scope of data handler callbacks
      var reader = this;
      //var encoding = this.engram;
      const _stats = this._stats;
      const count = this.options.pattern?.count || this.options.count || -1;
      const _options = this.options;

      var pipeline = this.pipeline = new chain(pipes);

      // eslint-disable-next-line arrow-parens
      pipeline.on('data', async (data) => {
        logger.debug("json parser on data");
        if (data.value) {
          //logger.debug(JSON.stringify(data.value));

          let construct = (_options.hasHeader) ? this.convert(data.value) : data.value;
          construct = this.encoder.cast(construct);
          construct = this.encoder.filter(construct);
          construct = this.encoder.select(construct);
          if (!construct)
            return;

          await this.output(construct);

          if (count > 0 && _stats.count >= count) {
            reader.push(null);
            pipeline.destroy();
          }
        }
      });

      pipeline.on('end', () => {
        logger.debug("json parser on end");
        reader.push(null);
      });

      pipeline.on('error', function (err) {
        logger.warn("JSONReader parser err " + err.message);
        // throw err;
      });

      ///// create the readstream
      this.stfs = await this.junction.getFileSystem();
      this.rs = await this.stfs.createReadStream(this.options);

      this.rs.setEncoding(this.options.fileEncoding || "utf8");

      this.rs.on('error',
        (err) => {
          logger.warn("JSONReader parser error: " + err.message);
          this.destroy(this.stfs?.StorageError(err) ?? new StorageError(err));
        }
      );

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) || new StorageError('JSONReader construct error'));
    }
  }


  // convert (JSON) array to object
  convert(row) {
    if (!Array.isArray(row))
      return row;

    let construct;
    if (this.options.hasHeader && !this._headers) {
      this._headers = row;
      if (!this.options.headers)
        this.options.headers = row;
    }
    else {
      // convert array to object
      construct = {};
      for (let i = 0; i < row.length; i++) {
        let name = this.options.headers[ i ] || i;
        construct[ name ] = row[ i ];
      }
    }

    return construct;
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

    if (this._stats.count && (this._stats.count % 100000 === 0))
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
    logger.debug('JSONReader _read');

    try {
      if (!this.started) {
        this.rs.pipe(this.pipeline);
        this.started = true;
      }
      else {
        this.parser.resume();
      }
    }
    catch (err) {
      logger.debug("JSONReader read error: " + err.message);
      this.destroy(err);
    }
  }

};
