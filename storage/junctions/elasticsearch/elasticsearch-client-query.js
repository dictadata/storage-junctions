/**
 * elasticsearch/query
 */
"use strict";

const elasticsearch = require("@elastic/elasticsearch");
const { StorageError } = require("../../types");
const { typeOf, logger } = require("../../utils");

/**
 * Notes about Elasticsearch Javascript API:
 *
 * Returned value will be a unique object containing:
 *   { body, statusCode, headers, warnings, meta }
 */


module.exports = exports = class ElasticQuery {
  /**
   * Elastic constructor
   * @param {*} options   {node:'', index:''}
   **/
  constructor(options) {
    if (typeOf(options) !== "object")
      throw new StorageError(400, "Invalid parameter: options");
    if (!options.node)
      throw new StorageError(400, "Missing options: node");
    if (!options.index)
      throw new StorageError(400, "Missing options: index");

    this.options = Object.assign({}, options);

    this.elasticOptions = {
      node: options.node,
      apiVersion: "7.x",
      log: options.log || "warning"
    };

    this.client = new elasticsearch.Client(this.elasticOptions);

    this.elasticParams = {
      index: options.index
    };
  }

  get node() {
    return this.elasticOptions.node;
  }
  set node(node) {
    this.elasticOptions.node = node;
  }

  /**
   * Insert a document into an index.
   * @param document The JSON document to index.
   **/
  insert(document) {
    logger.debug("elasticQuery insert");
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        body: document
      }, this.elasticParams);
      //logger.debug(JSON.stringify(params));

      this.client.index(params)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
          reject(error);
        });

    });
  }

  /**
   * Index/reindex a document to ElasticSearch.
   * @param uid Elastticseach document id
   * @param document The JSON document to index.
   **/
  put(uid, document) {
    logger.debug("elasticQuery put " + uid);
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        id: uid ? uid : null,
        body: document
      }, this.elasticParams);

      this.client.index(params)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
          reject(error);
        });

    });
  }

  /**
   * Retrieve a document from ElasticSearch.
   * @param uid ElasticSearch document id.
   **/
  get(uid) {
    logger.debug("elasticQuery get " + JSON.stringify(uid));
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        id: uid
      }, this.elasticParams);

      this.client.get(params)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
          reject(error);
        });

    });
  }

  /**
   * Delete a document from ElasticSearch.
   * @param uid The ElasticSearch document id
   **/
  delete(uid) {
    logger.debug("elasticQuery delete");
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        id: uid
      }, this.elasticParams);

      this.client.delete(params)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
          reject(error);
        });
    });
  }

  /**
   * Search for a unique document in ElasticSearch.
   * @param querystring HTTP style querystring e.g. "field1=value1&field2=value2"
   * @returns Only returns the first hit without sorting
   **/
  find(querystring) {
    logger.debug("elasticQuery find");
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        body: {
          "query": {
            "match": {}
          }
        }
      }, this.elasticParams);

      let pairs = querystring.split('&');
      for (let pair of pairs) {
        let kv = pair.split('=');
        params.body.query.match[kv[0]] = kv[1];
      }

      this.client.search(params)
        .then((response) => {
          //var hits = response.body.hits.hits;
          resolve(response);
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
          reject(error);
        });
    });
  }

  /**
   * Search for documents in ElasticSearch.
   * @param query Elasticsearch query document with query, filters, field list, etc.
   **/
  search(query, params = {}) {
    logger.debug("elasticQuery search");
    return new Promise((resolve, reject) => {

      var _params = Object.assign({}, this.elasticParams, params, { body: query });

      this.client.search(_params)
        .then((response) => {
          //var hits = response.body.hits.hits;
          resolve(response);
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
          reject(error);
        });
    });
  }

  /**
   * Search for documents in ElasticSearch.
   * @param query Elasticsearch query document with query, filters, field list, etc.
   **/
  deleteByQuery(query) {
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        body: query
      }, this.elasticParams);

      this.client.deleteByQuery(params)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
          reject(error);
        });
    });
  }

  /**
   * short-cut for deleteByQuery match_all
   */
  truncate() {
    return this.deleteByQuery({
      "query": {
        "match_all": {}
      }
    });
  }

  /**
   * Search for documents in ElasticSearch.
   * @param query Elasticsearch query document with query, filters, field list, etc.
   **/
  aggregate(query) {
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        body: query
      }, this.elasticParams);

      this.client.search(params)
        .then((response) => {
          resolve(response); // body: { aggregations: [] }
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
          reject(error);
        });
    });
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

      this.client.ping()
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
          reject(error);
        });
    });
  }

  /**
   * Return of list of indices in the Lucene catalog
   * @param {*} indexes comma-separated list or wildcard expression of index names
   */
  cat(index) {
    return new Promise((resolve, reject) => {

      var params = {
        index: index || '*',
        v: true
      };

      this.client.cat.indices(params)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
          reject(error);
        });
    });
  }

  /**
   * Refresh all indices.
   **/
  refresh(index) {
    return new Promise((resolve, reject) => {

      var params = {
        index: index || "_all"
      };

      this.client.indices.refresh(params)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
          reject(error);
        });
    });
  }

  /**
   * Create Index
   * @param {config} index settings and mappings
   */
  createIndex(config) {
    logger.debug("elasticQuery createIndex");
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        body: config // {settings:..., mappings:...}
      }, this.elasticParams);
      //logger.debug(JSON.stringify(params));

      this.client.indices.create(params)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
          reject(error);
        });
    });
  }

  /**
   * Delete Index
   */
  deleteIndex(indexName) {
    logger.debug("elasticQuery deleteIndex");
    return new Promise((resolve, reject) => {

      var params = Object.assign({}, this.elasticParams);
      if (indexName) params.index = indexName;

      this.client.indices.delete(params)
        .then((response) => {
          logger.debug("deleteIndex", response);
          resolve(response);
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
          reject(error);
        });
    });
  }

  /**
   * Get Mappings
   */
  getMapping() {
    logger.debug("elasticQuery getMapping");
    return new Promise((resolve, reject) => {

      var params = Object.assign({}, this.elasticParams);
      //params.type = "_doc";

      this.client.indices.getMapping(params)
        .then((response) => {
          logger.debug("getTemplate", response);
          let mappings = response.body[params.index].mappings._doc || response.body[params.index].mappings;
          resolve(mappings);  // {mappings:{}}
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
          reject(error);
        });

    });
  }

  /**
   * Put Mappings
   * @param mappings template name
   */
  putMapping(mappings) {
    logger.debug("elasticQuery putMapping");
    return new Promise((resolve, reject) => {

      var params = Object.assign({
        body: mappings
      }, this.elasticParams);

      this.client.indices.putMapping(params)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
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
        .then((response) => {
          logger.debug("getTemplate", response);
          resolve(response[template_name]);
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
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
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          logger.debug(JSON.stringify(error.meta.body));
          reject(error);
        });
    });
  }

};
