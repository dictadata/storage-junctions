"use strict";

const elasticsearch = require("@elastic/elasticsearch");
const logger = require("../logger");

module.exports = class Elastic {
  /**
   * Elastic constructor
   * @param {*} options   {node:'', index:''}
   **/
  constructor(options) {
    if (typeof options !== "object") throw new Error("Invalid parameter: options");
    if (!options.node) throw new Error("Missing options: node");
    if (!options.index) throw new Error("Missing options: index");

    this.options = Object.assign({},options);

    this.elasticOptions = {
      node: options.node,
      apiVersion: options.apiVersion || "7.x",
      log: options.log || "warning"
    };

    this.client = new elasticsearch.Client(this.elasticOptions);

    this.elasticParams = {
      index: options.index
    };
    if (this.elasticOptions.apiVersion < "7.0")
      this.elasticParams.type == options.doctype || "_doc";
  }

  get host() {
    return this.elasticOptions.node;
  }
  set host(host) {
    this.elasticOptions.node = host;
  }

  /**
   * Retrieve a document from ElasticSearch.
   * @param id ElasticSearch document id.
   **/
  get(_id) {
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        id: _id
      }, this.elasticParams);

      this.client.get(params)
        .then(response => {
          if (response.body._source) {
            resolve(response.body._source);
          } else {
            reject(new Error("id not found")); // shouldn't happen
          }
        })
        .catch(error => {
          if (error.statusCode === 404) {
            resolve(null);  // not found
          }
          else {
            logger.error(error.statusCode, error.message);
            reject(error);
          }
        });
    });
  }

  /**
   * Index/reindex a document to ElasticSearch.
   * @param document The JSON document to index.
   **/
  put(_id, document) {
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        id: _id,
        body: document
      }, this.elasticParams);

      this.client.index(params)
        .then(response => {
          resolve({ _id: response._id, _version: response._version });
        })
        .catch(error => {
          logger.error(error.message);
          reject(error);
        });
    });
  }

  /**
   * Delete a document from ElasticSearch.
   * @param _id The ElasticSearch _id for an existing document or null for a new document.
   **/
  delete(_id) {
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        id: _id
      }, this.elasticParams);

      this.client.delete(params)
        .then(response => {
          resolve(response.result);
        })
        .catch(error => {
          logger.error(error.message);
          reject(error);
        });
    });
  }

  /**
   * Insert a document into an index.
   * @param document The JSON document to index.
   **/
  insert(document) {
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        body: document
      }, this.elasticParams);

      this.client.index(params)
        .then(response => {
          resolve({ _id: response._id, _version: response._version });
        })
        .catch(error => {
          logger.error(error.message);
          reject(error);
        });
    });
  }

  /**
   * Search for documents in ElasticSearch.
   * @param querystring Lucine style query string
   * @returns Only returns the first hit
   **/
  find(querystring) {
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        q: querystring
      }, this.elasticParams);

      this.client.search(params)
        .then(response => {
          var hits = response.body.hits.hits;
          if (hits.length > 0) {
            resolve(hits[0]);
          } else {
            reject({message:"not found", statusCode:404});
          }
        })
        .catch(error => {
          logger.error(error.message);
          reject(error);
        });
    });
  }

  /**
   * Search for documents in ElasticSearch.
   *
   * @param querystring Lucine style query string
   * @returns Only returns the first hit
   **/
  notExists(querystring) {
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        q: querystring
      }, this.elasticParams);

      this.client.search(params)
        .then(response => {
          var hits = response.body.hits.hits;
          if (hits.length > 0) {
            reject({ statusCode: 409, message: "Conflict, a document exists" });
          } else {
            resolve({}); // no hits
          }
        })
        .catch(error => {
          logger.error(error.message);
          if (error.statusCode === 404) {
            resolve({}); // not found
          } else {
            reject(error);
          } // error
        });
    });
  }

  /**
   * Search for documents in ElasticSearch.
   * @param query ElastichSearch query document with query, filters, field list, etc.
   **/
  search(query,params={}) {
    return new Promise((resolve, reject) => {

      var _params = Object.assign({
        body: query
      }, this.elasticParams, params);

      this.client.search(_params)
        .then(response => {
          var hits = response.body.hits.hits;
          if (hits.length > 0) {
            resolve(hits);
          } else {
            resolve([]); // no hits
          }
        })
        .catch(error => {
          logger.error(error.message);
          reject(error);
        });
    });
  }

  /**
   * Search for documents in ElasticSearch.
   * @param query ElastichSearch query document with query, filters, field list, etc.
   **/
  aggregate(query) {
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        body: query
      }, this.elasticParams);

      this.client.search(params)
        .then(response => {
          resolve(response.aggregations);
        })
        .catch(error => {
          logger.error(error.message);
          reject(error);
        });
    });
  }

  /**
   * Search for documents in ElasticSearch.
   * @param query ElastichSearch query document with query, filters, field list, etc.
   **/
  deleteByQuery(query) {
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        body: query
      }, this.elasticParams);

      this.client.deleteByQuery(params)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          logger.error("deleteByQuery " + error.message);
          reject(error);
        });
    });
  }

  /**
   * short-cut for deleteByQuery match_all
   */
  async truncate() {
    let query = {
      "query": {
        "match_all": {}
      }
    };

    let response = await this.deleteByQuery(query)
    .catch(err => {
      return err;
    });

    return response;
  }

  /* ----------- Index and Server level functions --------- */

  /**
   * Ping elasticsearch service.
   **/
  status() {
    return new Promise((resolve, reject) => {

      var params = {
        requestTimeout: 5000
      };

      this.client.ping(params)
        .then(_response => {
          var results = "OK";
          resolve(results);
        })
        .catch(error => {
          logger.error(error.message);
          reject(error);
        });
    });
  }

  /**
   * Refresh all indices.
   **/
  refresh() {
    return new Promise((resolve, reject) => {

      var params = {
        index: "_all"
      };

      this.client.indices.refresh(params)
        .then(response => {
          resolve(response.result);
        })
        .catch(error => {
          logger.error(error.message);
          reject(error);
        });
    });
  }

  /**
   * Create Index
   * @param {settings} index settings and mappings
   */
  createIndex(settings) {
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        body: settings
      }, this.elasticParams);

      this.client.indices.create(params)
      .then(response => {
        //console.log("createIndex", response);
        resolve(response);
      })
      .catch(error => {
        logger.error(error.message);
        reject(error);
      });
    });
  }

  /**
   * Delete Index
   */
  deleteIndex() {
    return new Promise((resolve, reject) => {

      var params = Object.assign({
      }, this.elasticParams);

      this.client.indices.delete(params)
      .then(response => {
        //console.log("createIndex", response);
        resolve(response);
      })
      .catch(error => {
        logger.error(error.message);
        reject(error);
      });
    });
  }

  /**
   * Get Mappings
   */
  getMapping() {
    return new Promise((resolve, reject) => {

      var params = Object.assign({
      }, this.elasticParams);
      //params.type = "_doc";

      this.client.indices.getMapping(params)
      .then(response => {
        //console.log("getTemplate", response);
        let mappings = response.body[params.index].mappings._doc || response.body[params.index].mappings;
        resolve(mappings);  // {mappings:{}}
      })
      .catch(error => {
        logger.error("elastic.getMapping: ", error.message);
        reject(error);
      });
    });
  }

  /**
   * Put Mappings
   * @param mappings template name
   */
  putMapping(mappings) {
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        body: mappings
      }, this.elasticParams);

      this.client.indices.putMapping(params)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        logger.error(error.message);
        reject(error);
      });
    });
  }

  /**
   * Get template
   * @param template_name template name
   */
  getTemplate(template_name) {
    return new Promise((resolve, reject) => {

      var params = {
        name: template_name
      };

      this.client.indices.getTemplate(params)
      .then(response => {
        //console.log("getTemplate", response);
        resolve(response[template_name]);
      })
      .catch(error => {
        logger.error(error.message);
        reject(error);
      });
    });
  }

  /**
   * Put template
   * @param template_name template name
   * @param template_doc template document
   */
  putTemplate(template_name, template_doc) {
    return new Promise((resolve, reject) => {

      var params = {
        order: 1,
        create: false,
        name: template_name,
        body: template_doc
      };

      this.client.indices.putTemplate(params)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        logger.error(error.message);
        reject(error);
      });
    });
  }

};
