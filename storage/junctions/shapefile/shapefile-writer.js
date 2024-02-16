"use strict";

const { StorageWriter } = require('../storage-junction');
const { StorageError } = require("../../types");
const { hasOwnProperty, logger } = require("../../utils");

const path = require('path');

// import shapefiles reader


module.exports = exports = class ShapeFileWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    // check schema's extension
    if (path.extname(this.options?.schema) === '')
      this.options.schema = this.options.schema + '.shp';

    this.ws = null;
    this.openTag = '[\n';
    this.delim = ',\n';
    this.closeTag = '\n]';
  }

  async _construct(callback) {
    logger.debug("ShapeFileWriter._construct");

    try {
      // open output stream
      let stfs = await this.junction.getFileSystem();
      this.ws = await stfs.createWriteStream(this.options);
      this.ws.on('error',
        (err) => {
          this.destroy(err);
        });

      // write opening, if any
      await this.ws.write(this.openTag);

      callback();
    }
    catch (err) {
      logger.warn(err);
      callback(this.stfs?.Error(err) || new Error('ShapeFileWriter construct error'));
    }
  }

  /**
   *
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  async _write(construct, encoding, callback) {
    logger.debug("ShapeFileWriter._write");
    //logger.debug(JSON.stringify(construct));
    // check for empty construct
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }

    try {
      // save construct to .schema
      let data = (this._statistics.count === 0) ? "" : this.delim;
      if (this.engram.smt.model === 'shp')
        data += '"' + this._statistics.count + '": ';

      // rewrite construct to keep fields in order
      let ordered;
      if (this.options.orderFields) {
        let ordered = {};
        for (let field of this.engram.fields) {
          if (hasOwnProperty(construct, field.name) && construct[ field.name ] !== null)
            ordered[ field.name ] = construct[ field.name ];
          else if (field.hasDefault)
            ordered[ field.name ] = field.default;
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
      logger.warn(err);
      callback(new StorageError(500, 'ShapeFileWriter write error').inner(err));
    }

  }

  /**
   *
   * @param {*} chunks
   * @param {*} callback
   */
  async _writev(chunks, callback) {
    logger.debug("ShapeFileWriter._write");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[ i ].chunk;
        let encoding = chunks[ i ].encoding;

        // save construct to .schema
        await this._write(construct, encoding, () => { });
      }
      callback();
    }
    catch (err) {
      logger.warn(err);
      callback(new StorageError(500, 'Error storing construct').inner(err));
    }
  }

  /**
   *  close connection, cleanup resources, ...
   * @param {*} callback
   */
  async _final(callback) {
    logger.debug("ShapeFileWriter._final");

    try {
      if (this.ws) {
        if (this.autoClose) {
          // write close tag
          await new Promise((resolve) => {
            this.ws.end(this.closeTag, resolve);
          });
        }

        if (this.ws.fs_ws_promise)
          await this.ws.fs_ws_promise;
      }

      this._count(null);
      callback();
    }
    catch (err) {
      logger.warn(err);
      callback(new StorageError(500, 'Error _final').inner(err));
    }
  }

};
