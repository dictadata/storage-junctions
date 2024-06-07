"use strict";

const { StorageWriter } = require('../storage-junction');
const { logger } = require('@dictadata/lib');
const { dot, replace } = require('@dictadata/lib/utils');
const { readFile } = require('node:fs/promises');

module.exports = exports = class TemplateWriter extends StorageWriter {

  /**
   *
   * @param {StorageJunction} junction - parent storage-junction
   * @param {object} options
   * @param {string} options.template file path .json file to use as a template
   * @param {object} options.params name/value pairs to replace in the template, e.g. ${name}
   * @param {string} options.storeTo do notation path to the array to store constructs
   */
  constructor(junction, options) {
    super(junction, options);

    this.template;
    this.storeTo;
  }

  /**
   *
   * @param {*} callback
   */
  async _construct(callback) {
    logger.debug("TemplateWriter._construct");

    try {
      let text = await readFile(this.options.template);
      this.template = JSON.parse(text);
      replace(this.template, this.options.params);
      this.storeTo = dot.get(this.options.storeTo, this.template);

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError('TemplateWriter _construct error', { cause: err }));
    }
  }

  /**
   *
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  async _write(construct, encoding, callback) {
    logger.debug("TemplateWriter._write");

    // check for empty construct
    if (!construct || Object.keys(construct).length === 0) {
      callback();
      return;
    }
    //logger.debug(JSON.stringify(construct));

    try {
      // store construct in array
      this.storeTo.push(construct);

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError('TemplateWriter _write error', { cause: err }));
    }
  }

  /**
   *
   * @param {*} chunks
   * @param {*} callback
   */
  async _writev(chunks, callback) {
    logger.debug("TemplateWriter._writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[ i ].chunk;
        let encoding = chunks[ i ].encoding;

        // save construct to schema
        await this._write(construct, encoding, () => { });
      }
      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError("TemplateWriter _writev error", { cause: err }));
    }
  }

  /**
   *  close connection, cleanup resources, ...
   * @param {*} callback
   */
  async _final(callback) {
    logger.debug("TemplateWriter._final");

    let stfs;
    try {
      // open file stream
      stfs = await this.junction.getFileSystem();
      let ws = await stfs.createWriteStream(this.options);

      ws.on('error', (err) => {
        this.destroy(this.StorageError(err));
      });

      // write results to file
      let text = JSON.stringify(this.template,null,this.options.space);
      if (text.length > 0) {
        await ws.write(text);
      }

      if (this.autoClose) {
        await new Promise((resolve) => {
          ws.end(resolve);
        });
      }

      callback();
    }
    catch (err) {
      // logger.warn(err.message);
      callback(new StorageError('Error _final', { cause: err }));
    }
  }

};
