"use strict";

const { StorageWriter } = require('../storage-junction');
const { StorageError } = require("../../types");
const { hasOwnProperty, logger } = require("../../utils");

const path = require('path');


module.exports = exports = class JSONWriter extends StorageWriter {

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

    this.ws = null;

    this.formation;
    if (this.options.formation)
      this.formation = this.options.formation;
    else
      switch (this.engram.smt.model) {
        case 'jsons':
          this.formation = {
            opening: '',
            delimiter: '',
            closing: ''
          };
          break;
        case 'jsonl':
          this.formation = {
            opening: '',
            delimiter: '\n',
            closing: ''
          };
          break;
        case 'jsono':
          this.formation = {
            opening: '{\n',
            delimiter: ',\n',
            closing: '\n}'
          };
          break;
        case 'jsona':
        case 'json':
        default:
          this.formation = {
            opening: '[\n',
            delimiter: ',\n',
            closing: '\n]'
          };
      }

    this.stfs;
  }

  /**
   *
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  async _write(construct, encoding, callback) {
    logger.debug("JSONWriter._write");
    // check for empty construct
    if (!construct || Object.keys(construct).length === 0) {
      callback();
      return;
    }
    //logger.debug(JSON.stringify(construct));

    try {
      // save construct to .schema

      // check if file is open
      if (this.ws === null) {
        this.stfs = await this.junction.getFileSystem();
        this.ws = await this.stfs.createWriteStream(this.options);
        this.ws.on('error',
          (err) => {
            this.destroy(this.Error(err));
          });
        // write opening, if any
        if (this.formation.opening) await this.ws.write(this.formation.opening);
      }

      let data = (this._statistics.count === 0) ? "" : this.formation.delimiter;
      if (this.engram.smt.model === 'jsono') {
        let key = this.engram.get_uid(construct);
        if (!key)
          key = this._statistics.count;
        data += '"' + key + '": ';
      }

      // rewrite construct to keep fields in order
      let ordered;
      if (this.options.orderFields) {
        let ordered = {};
        for (let field of this.engram.fields) {
          if (hasOwnProperty(construct, field.name)) {
            if (construct[ field.name ] === null && field.hasDefault)
              ordered[ field.name ] = field.default;
            else
              ordered[ field.name ] = construct[ field.name ];
          }
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
      logger.error(err);
      callback(this.stfs?.Error(err) || new Error('JSONWriter write error'));
    }

  }

  /**
   *
   * @param {*} chunks
   * @param {*} callback
   */
  async _writev(chunks, callback) {
    logger.debug("JSONWriter._writev");

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
      logger.error(err);
      callback(this.stfs?.Error('JSONWriter writev error') || new Error("JSONWriter writev error"));
    }
  }

  /**
   *  close connection, cleanup resources, ...
   * @param {*} callback
   */
  async _final(callback) {
    logger.debug("JSONWriter._final");

    try {
      if (this.ws) {
        // write close tag
        if (this.formation.closing)
          await this.ws.write(this.formation.closing);

        await this.ws.end();

        if (this.ws.fs_ws_promise)
          await this.ws.fs_ws_promise;
        else
          await new Promise(
            (fulfill) => {
              this.ws.on("finish", fulfill);
            }
          );
      }
      this._count(null);
      callback();
    }
    catch (err) {
      // logger.error(err);
      callback(this.stfs?.Error(err) || new Error('Error _final'));
    }
  }

};
