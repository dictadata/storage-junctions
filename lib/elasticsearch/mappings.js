"use strict";

const logger = require("../logger");
const fs = require('fs');

module.exports = class ElasticMappings {

  constructor(junction) {
    //console.log("elastic mappings");
    this.junction = junction;
    this.encoding = junction._encoding;

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
    // replace encoding.fields
    this.encoding.fields.length = 0;

    // map mappings properties to encoding fields
    let exclude = {"@timestamp": 0, "tags": 0, "_meta": 0};
    let properties = this.mappings.properties;
    let keys = Object.keys(properties);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (key in exclude === false) {
        let f = {
          "name": key,
          "type": properties[key].type    // should translate from elasticsearch types to storage types
        };
        this.encoding.fields.push(f);
      }
    }

    //console.log(this.encoding);
    return this.encoding;
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
      this.encoding.merge(encoding);
    } else {
      this.encoding.fields = encoding.fields;
    }

    // map encoding to mappings
    //console.log("translate encoding");
    let fields = this.encoding.fields;
    let properties = this.mappings.properties;
    for (let i = 0; i < fields.length; i++) {
      let key = fields[i].name;
      let type = fields[i].type;
      if (typeof type !== "undefined") {
        properties[key] = {
          "type": fields[i].type      // should translate storage types to elasticsearch types
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
