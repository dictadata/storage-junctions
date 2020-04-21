"use strict";

const { Transform } = require('stream');
const storage = require("../../index");
const { StorageError } = require("../types");
const logger = require('../logger');


/*
  // example conjoin transform
  transforms: {
    conjoin: {
      smt: "rest|url/{tfield1}/|{tfield2}",
      options: {
        encoding: {},
        match: {
          field1: "{tfield3}"
        },
        cues: {
          fields: []
        }
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

    this.options = options;

    this.summary = {};
  }

  /**
   * string template style replacement
   *  template: "a string ${value1} ${cnt} ${value3}"
   *  source: { value1: "with", cnt: 3, value3: "replacements"}
   *  returns: "a string with 3 replacements"
   * @param {*} template a string containing replacement expressions of form ${propname}
   * @param {*} source source of replacement values, i.e. source[propname]
   */
  templateReplace (template, source) {
    const templateMatcher = /\$\{\s?([^{}\s]*)\s?\}/g;
    let text = template.replace(templateMatcher, (matched, p1) => {
      if (Object.prototype.hasOwnProperty.call(source,p1))
        return source[p1];
      else
        return matched;
    });
    return text;
  }

  /**
   * loop through an object running replacement on all string properties
   * @param {*} template
   * @param {*} source
   */
  templateObject(dest, source) {
    if (typeof dest === "string") {
      return this.templateReplace(dest, source);
    }
    else if (Array.isArray(dest)) {
      for (let i = 0; i < dest.length; i++)
        dest[i] = this.templateObject(dest[i], source);
    }
    else if (typeof dest === "object") {
      for (let [name,value] of Object.entries(dest)) {
        dest[name] = this.templateObject(value, source);
      }
    }
    return dest;
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  async _transform(construct, encoding, callback) {

    var jo;
    try {
      // do the template replacements
      let smt = this.templateObject(this.options.smt, construct);
      let options = this.templateObject(this.options.options, construct);

      // create origin junction
      jo = await storage.activate(smt, options);

      // retrieve
      let results = await jo.retrieve(options);

      for (let rcon of results.data) {
        // join results
        let conjoin = Object.assign({}, construct, rcon);
        this.push(conjoin);
      }
    }
    catch (err) {
      logger.error(err);
    }
    finally {
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
