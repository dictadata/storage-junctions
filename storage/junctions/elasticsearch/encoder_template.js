"use strict";

const Elastic = require("./query_elastic");
const fs = require('fs');
const logger = require("../../logger");

module.exports = exports = class ElasticTemplate {

  constructor(junction) {
    logger.debug("ElasticTemplate:");
    this.junction = junction;
    this.engram = junction.engram;
    this.template_name = this.engram.smt.schema;
    this.template = null;
    this.options = {
      node: this.engram.smt.locus,
      index: ''
    };
    this.templatesPath = junction.options.templatesPath || './storage/elasticsearch/templates/';
    this.defaultTemplate = junction.options.defaultTemplate || './storage/elasticsearch/_defaultTemplate.json';

    if (!fs.existsSync(this.templatesPath))
      fs.mkdirSync(this.templatesPath, { recursive: true });
  }

  /**
   *
   */
  async getEncoding() {
    logger.debug('elastic template getEncoding');

    let elastic = new Elastic(this.options);
    try {
      this.template = await elastic.getTemplate(this.template_name);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    if (!this.template)
      this.read();  // reads template cache or default template file

    logger.debug("translate encoding")
    // remove encoding fields
    this.engram.dull();

    // map template properties to encoding fields
    let exclude = { "@timestamp": 0, "tags": 0, "_meta": 0 };
    let properties = this.indexdoc.mappings.properties;
    let names = Object.keys(properties);

    for (let i = 0; i < names.length; i++) {
      let name = names[i];
      if (name in exclude === false) {
        let field = {
          "name": name,
          "type": properties[name].type
        };
        this.engram.add(field);
      }
    }

    logger.debug(this.engram);
    return this.engram;
  }

  /**
   *
   * @param {*} encoding
   */
  async putEncoding(encoding, merge = false) {
    logger.debug('elastic template putEncoding');

    let elastic = new Elastic(this.options);

    if (merge) {
      if (!this.template)
        await this.getEncoding();
      this.engram.encoding = encoding;
    } else {
      this.read(false); // read default template
      this.engram.fields = encoding.fields;

      // remove fields from template
      let exclude = { "@timestamp": 0, "tags": 0, "_meta": 0 };
      let properties = this.indexdoc.mappings.properties;
      let keys = Object.keys(properties);
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (key in exclude === false)
          delete properties[key];
      }
    }

    logger.debug("translate encoding");
    // map encoding to template
    // note, if properties weren't deleted above then this will merge fields
    let properties = this.indexdoc.mappings.properties;

    for (let [name, field] of Object.entries(this.engram.fields)) {
      properties[name] = {
        "type": field.type
      };
    }

    try {
      logger.debug("putTemplate:", this.template_name);
      logger.debug("template:", this.template);
      this.write();

      //let _results =
      await elastic.putTemplate(this.template_name, this.template);
      logger.debug(_results);
      return true;
    }
    catch (err) {
      logger.error("putTemplate", err);
      throw err;
    }
  }

  /**
   * Load template from local cache, if not found load default template
   */
  read(useCache = true) {
    logger.debug('elastic template read');

    let templateFile = this.templatesPath + this.template_name + ".json";
    if (useCache && fs.existsSync(templateFile)) {
      logger.debug(templateFile);
      this.template = JSON.parse(fs.readFileSync(templateFile, "utf8"));
    } else {
      logger.debug(templateDefault);
      this.template = JSON.parse(fs.readFileSync(this.defaultTemplate, "utf8"));
      this.template.index_patterns.length = 0;
      this.template.index_patterns.push(this.template_name + "*");
    }
  }

  /**
   * save template to local cache
   */
  write() {
    logger.debug('elastic template write');

    let templateFile = this.templatesPath + this.template_name + ".json";

    let json = JSON.stringify(this.template);
    fs.writeFileSync(templateFile, json, "utf8");
  }

};
