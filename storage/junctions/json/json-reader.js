"use strict";

const Storage = require('../../storage');
const { StorageReader } = require('../storage-junction');
const { StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');

const { parser } = require('stream-json/Parser');
const { streamValues } = require('stream-json/streamers/StreamValues');
const { streamArray } = require('stream-json/streamers/StreamArray');
const { streamObject } = require('stream-json/streamers/StreamObject');
const { chain } = require('stream-chain');
const { pick } = require('stream-json/filters/Pick');

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

    var encoder = this.junction.createEncoder(this.options);

    /***** create the parser, pipieline and data handlers *****/
    let jstream = (this.engram.smt.model === 'jsons' || this.engram.smt.model === 'jsonl');
    var myParser = this.myParser = parser({ jsonStreaming: jstream });
    var pipes = [ myParser ];

    if (this.options.pick) {
      pipes.push(pick({ filter: this.options.pick }));
    }

    if (this.engram.smt.model === 'jsons' || this.engram.smt.model === 'jsonl')
      pipes.push(streamValues());
    else if (this.engram.smt.model === 'jsono')
      pipes.push(streamObject());
    else  // default json array
      pipes.push(streamArray());

    // create variables that will be in the scope of data handler callbacks
    var reader = this;
    //var encoding = this.engram;
    const _stats = this._stats;
    const count = this.options.pattern?.count || this.options.count || -1;
    const _options = this.options;
    var _headers;

    var pipeline = this.pipeline = chain(pipes);

    // eslint-disable-next-line arrow-parens
    pipeline.on('data', (data) => {
      logger.debug("json parser on data");
      if (data.value) {
        //logger.debug(JSON.stringify(data.value));

        let construct = (_options.hasHeader) ? convert(data.value) : data.value;
        construct = encoder.cast(construct);
        construct = encoder.filter(construct);
        construct = encoder.select(construct);
        if (!construct)
          return;

        _stats.count += 1;
        if (!reader.push(construct)) {
          myParser.pause();  // If push() returns false stop reading from source.
        }

        if (_stats.count % 100000 === 0)
          logger.verbose(_stats.count + " " + _stats.interval + "ms");

        if (count > 0 && _stats.count >= count) {
          reader.push(null);
          pipeline.destroy();
          reader.stfs.relax();
        }
      }
    });

    pipeline.on('end', () => {
      logger.debug("json parser on end");
      reader.push(null);
      reader.stfs.relax();
    });

    pipeline.on('error', function (err) {
      logger.warn("JSONReader parser err " + err.message);
      // throw err;
    });

    // convert (JSON) array to object
    function convert(row) {
      if (!Array.isArray(row))
        return row;

      let construct;
      if (_options.hasHeader && !_headers) {
        _headers = row;
        if (!_options.headers)
          _options.headers = row;
      }
      else {
        // convert array to object
        construct = {};
        for (let i = 0; i < row.length; i++) {
          let name = _options.headers[ i ] || i;
          construct[ name ] = row[ i ];
        }
      }

      return construct;
    }

    this.stfs;
  }

  async _construct(callback) {
    logger.debug("JSONReader._construct");

    try {
      // start the reader
      this.stfs = await Storage.activateFileSystem(this.junction.smt, this.junction.options);
      var rs = await this.stfs.createReadStream(this.options);

      rs.setEncoding(this.options.fileEncoding || "utf8");

      rs.on('error',
        (err) => {
          logger.warn("JSONReader parser error: " + err.message);
          this.destroy(this.stfs?.StorageError(err) ?? new StorageError(err));
        }
      );

      rs.pipe(this.pipeline);

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) || new StorageError('JSONReader construct error'));
    }
  }
  async _destroy(err, callback) {
    if (this.stfs)
      this.stfs.relax();
    callback();
  }

  /**
   * An internal call to fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(_size) {
    logger.debug('JSONReader _read');

    try {
      if (this.myParser.isPaused()) {
        logger.debug("json reader parser paused");
        this.myParser.resume();
      }
      else if (this.myParser.destroyed || !this.myParser.readable) {
        logger.debug("json reader parser problem");
        this.push(null);
      }
    }
    catch (err) {
      logger.debug("JSONReader read error: " + err.message);
      this.destroy(err);
    }
  }

};
