"use strict";

const { StorageWriter } = require('../storage');
const { hasOwnProperty, StorageError } = require("../../types");
const logger = require('../../logger');

const path = require('path');

// import shapefiles reader


module.exports = exports = class ShapesWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    // check schema's extension
    if (this.options.schema && path.extname(this.options.schema) === '')
      this.options.schema = this.options.schema + '.shp';

    this.ws = null;
    this.openTag = '[\n';
    this.delim = ',\n';
    this.closeTag = '\n]';
  }

  /**
   *
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  async _write(construct, encoding, callback) {
    logger.debug("ShapesWriter._write");
    logger.debug(JSON.stringify(construct));
    // check for empty construct
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }

    try {
      // save construct to .schema

      // check if file is open
      if (this.ws === null) {
        let stfs = await this.junction.getFileSystem();
        this.ws = await stfs.createWriteStream(this.options);
        // write opening, if any
        await this.ws.write(this.openTag);
      }

      let data = (this._statistics.count === 0) ? "" : this.delim;
      if (this.engram.smt.model === 'shp')
        data += '"' + this._statistics.count + '": ';

      // rewrite construct to keep fields in order
      let ordered;
      if (this.options.orderFields) {
        let ordered = {};
        for (let [name, field] of Object.entries(this.engram.fields)) {
          if (hasOwnProperty(construct, name) && construct[name] !== null)
            ordered[name] = construct[name];
          else if (field.default)
            ordered[name] = field.default;
          // else don't copy field
        }
      }

      data += JSON.stringify(ordered ? ordered : construct);
      if (data.length > 0) {
        this._count(1);
        await this.ws.write(data);
      }

      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
    }

  }

  /**
   *
   * @param {*} chunks
   * @param {*} callback
   */
  async _writev(chunks, callback) {
    logger.debug("ShapesWriter._write");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        let encoding = chunks[i].encoding;

        // save construct to .schema
        await this._write(construct, encoding, () => {});
      }
      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
    }
  }

  /**
   *  close connection, cleanup resources, ...
   * @param {*} callback
   */
  async _final(callback) {
    logger.debug("ShapesWriter._final");

    try {
      if (this.ws) {
        // write close tag
        await this.ws.end(this.closeTag);

        if (this.ws.fs_ws_promise)
          await this.ws.fs_ws_promise;
        else
          await new Promise((fulfill) => this.ws.on("finish", fulfill));
      }
      this._count(null);
      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error _final'));
    }
  }

};
