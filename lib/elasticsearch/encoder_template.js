"use strict";

const Encoding = require("../encoding");
const Elastic = require("./query_elastic");
const fs = require('fs');
const logger = require("../logger");

module.exports = class ElasticTemplate {

  constructor(junction) {
    console.log("ElasticTemplate:");
    this.junction = junction;
    this.encoding = junction._encoding;
    this.template_name = this.encoding.schema;
    this.template = null;
    this.options = {
      node: this.encoding.encoding.location,
      index: ''
    };
    this.templatesPath = junction._options.templatesPath || './storage/elasticsearch/templates/';
    this.defaultTemplate = junction._options.defaultTemplate || './storage/elasticsearch/_defaultTemplate.json';

    if (!fs.existsSync(this.templatesPath))
      fs.mkdirSync(this.templatesPath, { recursive: true });
  }

  /**
   *
   */
  async getEncoding() {
    console.log('elastic template getEncoding');

    let elastic = new Elastic(this.options);
    try {
      this.template = await elastic.getTemplate(this.template_name);
    }
    catch(err) {
      logger.error(err);
      throw err;
    }

    if (!this.template)
      this.read();  // reads template cache or default template file

    //console.log("translate encoding")
    // remove encoding fields
    this.encoding.dull();

    // map template properties to encoding fields
    let exclude = {"@timestamp": 0, "tags": 0, "_meta": 0};
    let properties = this.indexdoc.mappings.properties;
    if (elastic.apiVersion < "7.0")
      properties = this.indexdoc.mappings._doc.properties;
    let names = Object.keys(properties);

    for (let i = 0; i < names.length; i++) {
      let name = names[i];
      if (name in exclude === false) {
        let field = {
          "name": name,
          "type": properties[name].type
        };
        this.encoding.add(field);
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
    console.log('elastic template putEncoding');

    let elastic = new Elastic(this.options);

    if (merge) {
      if (!this.template)
        await this.getEncoding();
      this.encoding.merge(encoding);
    } else {
      this.read(false); // read default template
      this.encoding.fields = encoding.fields;

      // remove fields from template
      let exclude = {"@timestamp": 0, "tags": 0, "_meta": 0};
      let properties = this.indexdoc.mappings.properties;
      if (elastic.apiVersion < "7.0")
        properties = this.indexdoc.mappings._doc.properties;
      let keys = Object.keys(properties);
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (key in exclude === false)
          delete properties[key];
      }
    }

    console.log("translate encoding");
    // map encoding to template
    // note, if properties weren't deleted above then this will merge fields
    let properties = this.indexdoc.mappings.properties;
    if (elastic.apiVersion < "7.0")
      properties = this.indexdoc.mappings._doc.properties;

    for (let [name, field] of Object.entries(this._encoding.fields)) {
      properties[name] = {
        "type": field.type
      };
    }

    try {
      console.log("putTemplate:", this.template_name);
      //console.log("template:", this.template);
      this.write();

      //let _results =
      await elastic.putTemplate(this.template_name, this.template);
      //console.log(_results);
      return true;
    }
    catch(err) {
      logger.error("putTemplate", err);
      throw err;
    }
  }

  /**
   * Load template from local cache, if not found load default template
   */
  read(useCache = true) {
    console.log('elastic template read');

    let templateFile = this.templatesPath + this.template_name + ".json";
    if (useCache && fs.existsSync(templateFile)) {
      //console.log(templateFile);
      this.template = JSON.parse(fs.readFileSync(templateFile, "utf8"));
    } else {
      //console.log(templateDefault);
      this.template = JSON.parse(fs.readFileSync(this.defaultTemplate, "utf8"));
      this.template.index_patterns.length = 0;
      this.template.index_patterns.push(this.template_name + "*");
    }
  }

  /**
   * save template to local cache
   */
  write() {
    console.log('elastic template write');

    let templateFile = this.templatesPath + this.template_name + ".json";

    let json = JSON.stringify(this.template);
    fs.writeFileSync(templateFile, json, "utf8");
  }

};
