/**
 * storage/junctions/linereader/linereader-reader.js
 *
 * This module has NOT been implemented, yet.
 *
 */
"use strict";

const { StorageReader } = require('../storage-junction');
const { logger } = require('@dictadata/lib');

const readline = require('node:readline');
const path = require('node:path');


module.exports = exports = class LineReaderReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this.parser;
    this.started = false;
    this.paused = false;

    this.separator = this.options?.separator;
    this.quoted = this.options?.quoted;
    this.header = this.options?.header;
    this.headers = this.options?.headers;
    this.raw = Object.hasOwn(this.options, "raw") ? this.options.raw : true;
  }

  async parse() {

    try {
      let encoder = this.junction.createEncoder(this.options);

      // open the input stream
      let stfs = await this.junction.getFileSystem();
      var rs = await stfs.createReadStream(this.options);
      rs.setEncoding(this.options.fileEncoding || "utf8");
      rs.on('close', () => {
        logger.debug("linereader reader close")
      })
      rs.on('end', () => {
        logger.debug("linereader reader end")
      })
      rs.on('error',
        (err) => {
          logger.warn(err);
          this.destroy(err);
        }
      );

      var reader = this;
      var statistics = this._stats;
      var max = this.options.max_read || -1;
      this.started = true;

      // create the parser
      var parser = this.parser = readline.createInterface({
        input: rs,
        crlfDelay: Infinity,
      });

      // eslint-disable-next-line arrow-parens
      parser.on('line', (line) => {
        if (line) {
          //logger.debug(line);
          let construct = line.split(reader.separator);

          if (reader.quoted) {
            let a = [];
            construct.forEach(item => {
              a.push((item && item[ 0 ] === reader.quoted) ? item.substring(1, item.length - 1) : item);
            })
            construct = a;
          }

          if (reader.header || reader.headers) {
            if (!reader.headers) {
              reader.headers = construct;
              return;
            }
            let o = {};
            for (let i = 0; i < reader.headers.length; i++)
              o[ reader.headers[ i ] ] = construct[ i ];
            construct = o;
          }

          if (!reader.raw && !Array.isArray(construct)) {
            construct = encoder.cast(construct);
            construct = encoder.filter(construct);
            construct = encoder.select(construct);
          }
          if (!construct)
            return;

          if (statistics.count % 100000 === 0)
            logger.verbose(statistics.count + " " + statistics.interval + "ms");

          if (max > 0 && statistics.count > max) {
            reader.push(null);
            reader.destroy();
            parser.close();
          }
          else {
            reader._stats.count += 1;
            if (!reader.push(construct)) {
              reader.paused = true;
              parser.pause();
            }
          }
        }
      });

      parser.on('close', () => {
        reader.push(null);
        let stats = reader._stats;
        logger.verbose(stats.count + " in " + stats.elapsed / 1000 + "s, " + Math.round(stats.count / (stats.elapsed / 1000)) + "/sec");
      });

    }
    catch (err) {
      logger.debug("LineReaderReader parse error: " + err.message);
      this.destroy(err);
    }
  }

  async _construct(callback) {
    logger.debug("LineReaderReader._construct");

    try {
      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) || new StorageError('LineReaderReader construct error'));
    }
  }

  /**
   * An internal call to fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(_size) {
    logger.debug('LineReaderReader _read');

    try {
      if (!this.started) {
        this.parse();
      }
      else if (this.paused) {
        this.paused = false;
        this.parser.resume();
      }
    }
    catch (err) {
      logger.warn(err.message);
    }
  }

};
