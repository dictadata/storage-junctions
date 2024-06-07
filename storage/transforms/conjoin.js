/**
 * storage/transforms/conjoin.js
 */
"use strict";

const Storage = require('../storage');
const { Transform } = require('node:stream');
const { logger } = require('@dictadata/storage-lib');
const { replace } = require('@dictadata/storage-lib/utils');

/*
  // example conjoin transform
  {
    transform: "conjoin",

    smt: "rest|url/${tfield1}/|${tfield2}",
    options: {},
    pattern: {
      match: {
        field1: "${tfield3}"
      },
      fields: []
    }
  };
*/

module.exports = exports = class ConjoinTransform extends Transform {

  /**
   *
   * @param {*} options conjoin options
   */
  constructor(options) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 128
    };
    super(streamOptions);

    this.options = Object.assign({}, options);
    this.junction;
  }

  async activate() {
    logger.debug("conjoin activate");

    try {
      if (this.options.keepAlive)
        this.junction = await Storage.activate(this.options.smt, this.options.options);
    }
    catch (err) {
      logger.warn(err.message);
    }
  }

  async relax() {
    if (this.junction)
      await this.junction.relax();
  }

  /**
  * Internal call from streamWriter to process an object
  * @param {*} construct
  * @param {*} encoding
  * @param {*} callback
  */
  async _transform(construct, encoding, callback) {
    logger.debug("conjoin _transform");

    try {
      // do the template replacements
      let options = replace(this.options.options, construct);
      let pattern = replace(this.options.pattern, construct);

      if (!this.junction) {
        logger.debug("conjoin activate junction");
        let smt = replace(this.options.smt, construct);
        logger.debug(JSON.stringify(smt, null, 2));
        this.junction = await Storage.activate(smt, options);
      }

      // retrieve
      logger.debug("conjoin retrieve");
      let results = await this.junction.retrieve(pattern);
      //logger.debug(JSON.stringify(results,null,2));

      if (results.status === 0) {
        for (let con of results.data) {
          // join results
          let conjoin = Object.assign({}, construct, con);
          logger.debug("conjoin push " + JSON.stringify(conjoin, null, 2));
          this.push(conjoin);
        }
      }
      else {
        // push original construct without additional fields
        this.push(construct);
      }
    }
    catch (err) {
      logger.warn(err.message);
    }
    finally {
      if (!this.options.keepAlive) {
        logger.debug("conjoin relax");
        if (this.junction) await this.junction.relax();
        this.junction = undefined;
      }
    }

    callback();
  }

  /*
    _flush(callback) {
      logger.debug("transform _flush");

      // push some final object(s)
      //this.push(this._composition);

      callback();
    }
  */
};
