"use strict";

const StorageReader = require('../storage-junction/reader');
const logger = require('../logger');

const path = require('path');

const { parser } = require('stream-json/Parser');
const { streamValues } = require('stream-json/streamers/StreamValues');
const { streamArray } = require('stream-json/streamers/StreamArray');
const { streamObject } = require('stream-json/streamers/StreamObject');
const { chain } = require('stream-chain');
const { pick } = require('stream-json/filters/Pick');

module.exports = exports = class JsonReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    // check schema's extension
    if (this.options.schema && path.extname(this.options.schema) === '')
      this.options.schema = this.options.schema + '.json';

    // set capabilities of the StorageReader
    this.useTransforms = true;  // the data source doesn't support queries, so use the base junction will use Transforms to filter and select

    /***** create the parser and data handlers *****/
    var reader = this;
    var encoding = this.engram;

    function cast(construct) {

      for (let [name, value] of Object.entries(construct)) {
        let field = encoding.find(name);
        let newValue = value;

        if (value === null) {
          newValue = field.default;
        }
        else if (field.type === 'integer') {
          newValue = Number.parseInt(value, 10);
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

    // create the parser chain pipeline
    let myParser = this.myParser = parser();
    let pipes = [myParser];
    
    if (this.options.pick) {
      pipes.push(pick({ filter: this.options.pick }));
    }

    if (this.engram.smt.model === 'jsons' || this.engram.smt.model === 'jsonl')
      pipes.push(streamValues());
    else if (this.engram.smt.model === 'jsono')
      pipes.push( streamObject());
    else  // default json array
      pipes.push(streamArray());

    let pipeline = this.pipeline = chain(pipes);
    
    var statistics = this._statistics;
    var max = this.options.max_read || -1;

    // eslint-disable-next-line arrow-parens
    pipeline.on('data', (data) => {
      if (data.value) {
        let c = cast(data.value);
        logger.debug(JSON.stringify(data.value));
        if (data.value && !reader.push(c))
          myParser.pause();  // If push() returns false stop reading from source.

        if (statistics.count % 1000 === 0)
          logger.verbose(statistics.count);
        if (max >= 0 && statistics.count >= max) {
          reader.push(null);
          myParser.destroy();
        }
      }
    });

    pipeline.on('end', () => {
      reader.push(null);
    });

    pipeline.on('error', function (err) {
      logger.error(err);
    });

    this.started = false;
  }

  /**
   * An internal call to fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(_size) {
    logger.debug('JsonReader _read');

    if (!this.started) {
      // start the reader
      let stfs = await this.junction.getFileSystem();
      var rs = await stfs.createReadStream(this.options);
      rs.pipe(this.pipeline);
      this.started = true;
    }
    else if (this.myParser.isPaused()) {
      // resume reading
      this.myParser.resume();
    }
    else if (this.myParser.destroyed || !this.myParser.readable)
      this.push(null);
  }

};
