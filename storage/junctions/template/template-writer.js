"use strict";

const { StorageWriter } = require('../storage-junction');
const { logger, dot, replace } = require("../../utils");

module.exports = exports = class TemplateWriter extends StorageWriter {

  /**
   *
   * @param {StorageJunction} junction - parent storage-junction
   * @param {Object} options
   * @param {String} options.template file path .json file to use as a template
   * @param {Object} options.params name/value pairs to replace in the template, e.g. ${name}
   * @param {String} options.storeTo do notation path to the array to store constructs
   */
  constructor(junction, options) {
    super(junction, options);

    this.jsonObject;
    this.store;
  }

  /**
   *
   * @param {*} callback
   */
  async _construct(callback) {
    logger.debug("TemplateWriter._construct");

    try {
      let text = await fs.readFile(this.options.template);
      this.jsonObject = JSON.parse(text);
      replace(this.jsonObject, this.options.params);
      this.store = dot.get(this.options.storeTo, jsonObject);

      callback();
    }
    catch (err) {
      logger.warn(err);
      callback(new Error('TemplateWriter _construct error'));
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
      this.store.push(construct);

      callback();
    }
    catch (err) {
      logger.warn(err);
      callback(new Error('TemplateWriter _write error'));
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
      logger.warn(err);
      callback(this.stfs?.Error('TemplateWriter _writev error') || new Error("TemplateWriter _writev error"));
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
        this.destroy(this.Error(err));
      });

      // write results to file
      let data = JSON.stringify(this.jsonObject);
      if (data.length > 0) {
        await ws.write(data);
      }

      if (this.autoClose) {
        await new Promise((resolve) => {
          ws.end(resolve);
        });
      }

      callback();
    }
    catch (err) {
      // logger.warn(err);
      callback(stfs?.Error(err) || new Error('Error _final'));
    }
  }

};
