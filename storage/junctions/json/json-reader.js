"use strict";

const { StorageReader } = require('../storage-junction');
const { logger } = require('../../utils');

const path = require('path');

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
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    // check schema's extension
    //if (this.options.schema && path.extname(this.options.schema) === '')
    //  this.options.schema = this.options.schema + '.json';

    this.started = false;
    var encoder = this.junction.createEncoder(options);

    /***** create the parser, pipieline and data handlers *****/
    var myParser = this.myParser = parser();
    var pipes = [ myParser ];

    if (this.options.extract) {
      pipes.push(pick({ filter: this.options.extract }));
    }

    if (this.engram.smt.model === 'jsons' || this.engram.smt.model === 'jsonl')
      pipes.push(streamValues());
    else if (this.engram.smt.model === 'jsono')
      pipes.push(streamObject());
    else  // default json array
      pipes.push(streamArray());

    // create variables that will be in the scope of data hander callbacks
    var reader = this;
    var encoding = this.engram;
    var statistics = this._statistics;
    var max = this.options.max_read || -1;
    var array_of_arrays = this.options.array_of_arrays;
    var header = Array.isArray(array_of_arrays) ? array_of_arrays : null;

    var pipeline = this.pipeline = chain(pipes);

    // eslint-disable-next-line arrow-parens
    pipeline.on('data', (data) => {
      logger.debug("json parser on data");
      if (data.value) {
        //logger.debug(JSON.stringify(data.value));

        let construct = (array_of_arrays) ? convert(data.value) : data.value;
        construct = encoder.cast(construct);
        construct = encoder.filter(construct);
        construct = encoder.select(construct);

        if (construct && !reader.push(construct)) {
          //myParser.pause();  // If push() returns false stop reading from source.
        }

        if (statistics.count % 1000 === 0)
          logger.verbose(statistics.count);

        if (max >= 0 && statistics.count >= max) {
          reader.push(null);
          myParser._destroy();
        }
      }
    });

    pipeline.on('end', () => {
      logger.debug("json parser on end");
      reader.push(null);
    });

    pipeline.on('error', function (err) {
      logger.debug("json parser on error");
      //logger.error(err);
      throw err;
    });

    // convert array to object
    function convert(data) {
      if (!Array.isArray(data))
        return data;

      let c;
      if (!header) {
        header = data;
      }
      else {
        // convert array to object
        c = {};
        for (let i = 0; i < header.length; i++) {
          if (i >= data.length)
            break;
          c[ header[ i ] ] = data[ i ];
        }
      }

      return c;
    }

    // cast fields to match junction encoding, if encoding is defined
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

  }

  /**
   * An internal call to fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(_size) {
    logger.debug('JSONReader _read');

    if (!this.started) {
      // start the reader
      let stfs = await this.junction.getFileSystem();
      var rs = await stfs.createReadStream(this.options);
      rs.setEncoding(this.options.fileEncoding || "utf8");
      rs.on("error",
        (err) => {
          logger.debug("json reader on parser error");
          this._destroy(err);
        }
      );
      rs.pipe(this.pipeline);
      this.started = true;
    }
    else if (this.myParser.isPaused()) {
      logger.debug("json reader parser paused")
      this.myParser.resume();
    }
    else if (this.myParser.destroyed || !this.myParser.readable) {
      logger.debug("json reader parser problem");
      this.push(null);
    }
  }

};
