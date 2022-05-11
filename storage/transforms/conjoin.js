"use strict";

const { Transform } = require('stream');
const Cortex = require("../cortex");
const { logger, templateReplace } = require("../utils");

/*
  // example conjoin transform
  transform: {
    conjoin: {
      smt: "rest|url/${tfield1}/|${tfield2}",
      options: {
        match: {
          field1: "${tfield3}"
        },
        fields: []
      }
    }
  };
*/

module.exports = exports = class ConjoinTransform extends Transform {

  /**
   *
   * @param {*} options transform options
   */
  constructor(options) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 128
    };
    super(streamOptions);

    this.options = Object.assign({}, options);

    this.summary = {};
  }

  /**
  * Internal call from streamWriter to process an object
  * @param {*} construct
  * @param {*} encoding
  * @param {*} callback
  */
  async _transform(construct, encoding, callback) {
    logger.debug("conjoin _transform");

    var jo;
    try {
      // do the template replacements
      let smt = templateReplace(this.options.smt, construct);
      let options = templateReplace(this.options.options, construct);
      let pattern = options.match;

      // create origin junction
      logger.debug("conjoin activate jo");
      //logger.debug(JSON.stringify(smt,null,2));
      jo = await Cortex.activate(smt, options);

      // retrieve
      logger.debug("conjoin retrieve");
      let results = await jo.retrieve(pattern);
      //logger.debug(JSON.stringify(results,null,2));

      for (let rcon of results.data) {
        // join results
        let conjoin = Object.assign({}, construct, rcon);
        logger.debug("conjoin push " + JSON.stringify(conjoin, null, 2));
        this.push(conjoin);
      }
    }
    catch (err) {
      logger.error(err);
    }
    finally {
      logger.debug("conjoin relax");
      if (jo) await jo.relax();
    }

    callback();
  }

  /* optional */
  _flush(callback) {
    // push the final object(s)
    //let newConstruct = {};
    //this.push(newConstruct);

    callback();
  }

};
