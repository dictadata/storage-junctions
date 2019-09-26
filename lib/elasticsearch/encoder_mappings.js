/**
 * elasticsearch/encoder
 */
"use strict";

const logger = require("../logger");
const fs = require('fs');

module.exports = class ElasticMappings {

  constructor(junction) {
    //console.log("elastic mappings");
    this.junction = junction;
    this.engram = junction._engram;

    this.elastic = junction.elastic;
    this.settings = null;
    this.mappings = null;

    this.mappingsPath = junction._options.mappingsPath || './storage/elasticsearch/mappings/';
    this.defaultMappings = junction._options.defaultMappings || './storage/elasticsearch/mappings/_defaultMappings.json';

    if (!fs.existsSync(this.mappingsPath))
      fs.mkdirSync(this.mappingsPath, { recursive: true });
  }

  /**
   *
   */
  async getEncoding() {
    //console.log('mappings getEncoding');

    this._read(false);  // read default index configuration file

    try {
      this.mappings = await this.elastic.getMapping();
    }
    catch(err) {
      logger.error(err.message);
    }

    //console.log("translate encoding")
    // replace engram.fields
    this.engram.dull();

    // map mappings properties to encoding fields
    let exclude = {"@timestamp": 0, "tags": 0, "_meta": 0};
    let properties = this.mappings.properties;
    let names = Object.keys(properties);
    for (let i = 0; i < names.length; i++) {
      let name = names[i];
      if (name in exclude === false) {
        let field = {
          "name": name,
          "type": properties[name].type    // should translate from elasticsearch types to storage types
        };
        this.engram.fields[name] = field;
      }
    }

    //console.log(this.engram);
    return this.engram;
  }

  /**
   *
   * @param {*} encoding
   */
  async putEncoding(encoding, merge=false) {
    //console.log('mappings putEncoding');

    if (!this.mappings)
      await this.getEncoding();

    if (merge) {
      this.engram.merge(encoding);
    } else {
      this.engram.fields = encoding.fields;
    }

    // map encoding to mappings
    //console.log("translate encoding");
    let properties = this.mappings.properties;
    for (let [name, field] of Object.entries(this._engram.fields)) {
      if (typeof field.type !== "undefined") {
        properties[name] = {
          "type": field.type      // should translate storage types to elasticsearch types
        };
      }
    }

    let create = false;
    try {
      //console.log("putMapping:", this.mappings);
      let results = await this.elastic.putMapping(this.mappings);
      //console.log("putMapping: ", results);

      return true;
    }
    catch(err) {
      if (err.statusCode === 404)
        create = true;
      else {
        logger.error("putEncoding error: ", err.message);
        throw err;
      }
    }

    try {
      if (create) {
        await this.elastic.createIndex({settings: this.settings, mappings: this.mappings});
      }
    }
    catch(err) {
      logger.error("putEncoding error: ", err.message);
    }

  }

  /**
   * Load mappings from local cache, if not found load default mappings
   */
  _read(useCache = true) {
    //console.log('mappings _read');

    let mappingsFile = this.mappingsPath + this.index + ".json";
    if (useCache && fs.existsSync(mappingsFile)) {
      //console.log(mappingsFile);
      let doc = JSON.parse(fs.readFileSync(mappingsFile, "utf8"));
      this.settings = doc.settings;
      this.mappings = doc.mappings;
    } else {
      //console.log(mappingsDefault);
      let doc = JSON.parse(fs.readFileSync(this.defaultMappings, "utf8"));
      this.settings = doc.settings;
      this.mappings = doc.mappings;
    }
  }

  /**
   * save mappings to local cache
   */
  _write() {
    //console.log('mappings _write');

    let mappingsFile = this.mappingsPath + this.index + ".json";

    let json = JSON.stringify({settings: this.settings, mappings: this.mappings});
    fs.writeFileSync(mappingsFile, json, "utf8");
  }

};
