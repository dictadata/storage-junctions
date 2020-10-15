"use strict";

const StorageWriter = require('../junction/writer');
const Types = require("../types");
const StorageError = Types.StorageError;
const logger = require('../logger');

const Cortex = require('../cortex');

module.exports = exports = class JsonWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this.ws = null;
    this.count = 0;
    switch (this.engram.smt.model) {
      case 'jsons':
        this.openTag = '';
        this.delim = '';
        this.closeTag = '';
        break;
      case 'jsonl':
        this.openTag = '';
        this.delim = '\n';
        this.closeTag = '';
        break;
      case 'jsono':
        this.openTag = '{\n';
        this.delim = ',\n';
        this.closeTag = '\n}';
        break;
      case 'jsona':
      case 'json':
      default:
        this.openTag = '[\n';
        this.delim = ',\n';
        this.closeTag = '\n]';
    }
  }

  /**
   *
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  async _write(construct, encoding, callback) {
    logger.debug("StorageWriter _write");

    try {
      // save construct to .schema

      // check if file is open
      if (this.ws === null) {
        let stfs = await this.junction.getFileSystem();
        this.ws = await stfs.createWriteStream(this.options);
        // write opening, if any
        await this.ws.write(this.openTag);
      }

      let data = (this.count === 0) ? "" : this.delim;
      if (this.engram.smt.model === 'jsono')
        data += '"' + this.count + '": ';

      // rewrite construct to keep fields in order
      let orderedConstruct = {};
      for (let [name, field] of Object.entries(this.engram.fields)) {
        if (Object.prototype.hasOwnProperty.call(construct, name) && construct[name] !== null)
          orderedConstruct[name] = construct[name];
        else if (field.default)
          orderedConstruct[name] = field.default;
        // else don't copy field
      }

      data += JSON.stringify(orderedConstruct);
      if (data.length > 0) {
        await this.ws.write(data);
      }

      this.count++;
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
    logger.debug("StorageWriter _writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        let encoding = chunks[i].encoding;

        // save construct to schema
        await this._write(construct, encoding, () => { });
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

    try {
      if (this.ws) {
        // write close tag
        await this.ws.end(this.closeTag);

        if (this.ws.fs_ws_promise)
          await this.ws.fs_ws_promise;
        else
          await new Promise((fulfill) => this.ws.on("finish", fulfill));
      }
      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error _final'));
    }
  }

};
