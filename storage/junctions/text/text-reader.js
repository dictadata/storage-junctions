/**
 * storage/junctions/text/text-reader.js
 *
 * This module has NOT been implemented, yet.
 *
 */
"use strict";

const Storage = require('../../storage');
const { StorageReader } = require('../storage-junction');
const { logger } = require('@dictadata/lib');

const readline = require('node:readline/promises');
const path = require('node:path');


module.exports = exports = class TextReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   * @param {boolean}  options.hasHeader input includes a header row, default false
   * @param {string[]} options.headers values to use for field names, default undefined
   * @param {string}   options.separator field separator value, default ','
   * @param {string}   options.quoted quote character value, default '""
   * @param {number}   options.count maximum number of rows to read, default all
   * @param {boolean}  options.raw output raw data as arrays
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this.parser;
    this.started = false;
    this.paused = false;

    this.separator = this.options?.separator;
    this.quoted = this.options?.quoted || '"';
    this.hasHeader = this.options?.hasHeader;
    this.headers = this.options?.headers;
    this.raw = Object.hasOwn(this.options, "raw") ? this.options.raw : false;

    if (!options.raw && !this.headers && options.encoding)
      this.headers = this.engram.names;
  }

  /**
   * Parse line into fields by looking for separator and quoted characters.
   *
   * @param {String} line
   * @returns
   */
  parseLine(line) {
    let row = [];
    let value = [];

    const iterator = line[ Symbol.iterator ]();
    let ch = iterator.next();

    while (!ch.done) {
      if (ch.value === this.quoted) {
        ch = iterator.next();

        while (!ch.done && ch.value !== this.quoted) {
          value.push(ch.value);
          ch = iterator.next();
        }
        if (!ch.done)
          ch = iterator.next();
      }

      while (!ch.done && ch.value !== this.separator) {
        value.push(ch.value);
        ch = iterator.next();
      }

      row.push(value.join(""));
      value.length = 0;

      if (!ch.done && ch.value === this.separator) {
        ch = iterator.next();
        if (ch.done)
          row.push(value.join(""));
      }
      else if (!ch.done)
        throw "TextReader invalid character found: " + ch.value;
    }

    return row;
  }

  async parse() {

    try {
      let encoder = this.junction.createEncoder(this.options);

      // open the input stream
      this.stfs = await Storage.activateFileSystem(this.junction.smt, this.junction.options);
      var rs = await this.stfs.createReadStream(this.options);
      rs.setEncoding(this.options.fileEncoding || "utf8");
      rs.on('close', () => {
        logger.debug("stfs reader close")
      });
      rs.on('end', () => {
        logger.debug("stfs reader end")
      });
      rs.on('error',
        (err) => {
          logger.warn(err);
          this.destroy(err);
        }
      );

      var reader = this;
      var _stats = this._stats;
      var count = this.options?.pattern?.count || this.options?.count || -1;
      this.started = true;

      // create the parser
      var parser = this.parser = readline.createInterface({
        input: rs,
        crlfDelay: Infinity,
      });

      // eslint-disable-next-line arrow-parens
      parser.on('line', (line) => {
        if (line) {
          logger.debug(line);

          //let construct = line.split(reader.separator);
          let row = reader.parseLine(line);
          let construct;

          if (reader.hasHeader && !reader._headers) {
            reader._headers = row;
            if (!reader.headers)
              reader.headers = row;
            return;
          }

          if (reader.headers && !reader.raw) {
            construct = {};
            for (let i = 0; i < row.length; i++) {
              let name = reader.headers[ i ] || i;
              construct[ name ] = row[ i ];
            }
          }

          if (reader.raw) {
            construct = row;
          }
          else if (construct) {
            construct = encoder.cast(construct);
            construct = encoder.filter(construct);
            construct = encoder.select(construct);
          }
          if (!construct)
            return;

          _stats.count += 1;
          let result = reader.push(construct)
          if (!result) {
            reader.paused = true;
            rs.pause();
            parser.pause();
          }

          if (_stats.count % 100000 === 0)
            logger.verbose(_stats.count + " " + _stats.interval + "ms");

          if (count > 0 && _stats.count >= count) {
            reader.push(null);
            reader.destroy();
            parser.close();
            reader.stfs.relax();
          }
        }
      });

      parser.on('pause', () => {
        logger.debug("text-reader pause");
      });

      parser.on('resume', () => {
        logger.debug("text-reader resume");
      });

      parser.on('close', () => {
        reader.push(null);
        reader.stfs.relax();
        let stats = reader._stats;
        logger.verbose(stats.count + " in " + stats.elapsed / 1000 + "s, " + Math.round(stats.count / (stats.elapsed / 1000)) + "/sec");
      });

    }
    catch (err) {
      logger.debug("TextReader parse error: " + err.message);
      this.destroy(err);
    }
  }

  async _construct(callback) {
    logger.debug("TextReader._construct");

    try {
      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) || new StorageError('TextReader construct error'));
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
    logger.debug('TextReader _read');

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
