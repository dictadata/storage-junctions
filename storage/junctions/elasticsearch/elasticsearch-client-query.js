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
  async insert(document) {
    logger.debug("elasticQuery insert");

    try {
      var params = Object.assign({
        body: document
      }, this.elasticParams);
      if (this.options.refresh)
        params[ "refresh" ] = this.options.refresh;
      //logger.debug(JSON.stringify(params));

      let response = await this.client.index(params);
      return response;
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }

  }

  /**
   * Index/reindex a document to ElasticSearch.
   * @param uid Elastticseach document id
   * @param document The JSON document to index.
   **/
  async put(uid, document) {
    logger.debug("elasticQuery put " + uid);

    try {
      var params = Object.assign({
        id: uid ? uid : null,
        body: document
      }, this.elasticParams);
      if (this.options.refresh)
        params[ "refresh" ] = this.options.refresh;

      let response = await this.client.index(params);
      return response;
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }

  }

  /**
   * Retrieve a document from ElasticSearch.
   * @param uid ElasticSearch document id.
   **/
  async get(uid) {
    logger.debug("elasticQuery get " + JSON.stringify(uid));

    try {
      var params = Object.assign({
        id: uid
      }, this.elasticParams);

      let response = await this.client.get(params);
      return response;
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }
  }

  /**
   * Delete a document from ElasticSearch.
   * @param uid The ElasticSearch document id
   **/
  async delete(uid) {
    logger.debug("elasticQuery delete");

    try {
      var params = Object.assign({
        id: uid
      }, this.elasticParams);
      if (this.options.refresh)
        params[ "refresh" ] = this.options.refresh;

      let response = await this.client.delete(params);
      return response;
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }
  }

  /**
   * Search for a unique document in ElasticSearch.
   * @param querystring HTTP style querystring e.g. "field1=value1&field2=value2"
   * @returns Only returns the first hit without sorting
   **/
  async find(querystring) {
    logger.debug("elasticQuery find");

    try {
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
        params.body.query.match[ kv[ 0 ] ] = kv[ 1 ];
      }

      let response = await this.client.search(params);
      //var hits = response.body.hits.hits;
      return response;
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }
  }

  /**
   * Search for documents in ElasticSearch.
   * @param query Elasticsearch query document with query, filters, field list, etc.
   **/
  async search(query, params = {}) {
    logger.debug("elasticQuery search");

    try {
      var _params = Object.assign({}, this.elasticParams, params, { body: query });

      let response = await this.client.search(_params);
      //var hits = response.hits.hits;
      return response;
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }
  }

  /**
   * Search for documents in ElasticSearch.
   * @param query Elasticsearch query document with query, filters, field list, etc.
   **/
  async deleteByQuery(query) {
    try {
      var params = Object.assign({
        body: query
      }, this.elasticParams);
      if (this.options.refresh)
        params[ "refresh" ] = this.options.refresh;

      let response = await this.client.deleteByQuery(params);
      return response;
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }
  }

  /**
   * short-cut for deleteByQuery match_all
   */
  async truncate() {
    return await this.deleteByQuery({
      "query": {
        "match_all": {}
      }
    });
  }

  /**
   * Search for documents in ElasticSearch.
   * @param query Elasticsearch query document with query, filters, field list, etc.
   **/
  async aggregate(query) {
    try {
      var params = Object.assign({
        body: query
      }, this.elasticParams);

      let response = await this.client.search(params);
      return response; // body: { aggregations: [] }
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }
  }

  /* ----------- Index and Server level functions --------- */

  /**
   * Ping elasticsearch service.
   **/
  async status() {
    try {
      var params = {
        requestTimeout: 5000
      };

      let response = await this.client.ping(params);
      return response;
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }
  }

  /**
   * Return of list of indices in the Lucene catalog
   * @param {*} indexes comma-separated list or wildcard expression of index names
   */
  async cat(index) {

    try {
      var params = {
        index: index || '*',
        format: 'json',
        v: true
      };

      let response = await this.client.cat.indices(params);
      return response;
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }

  }

  /**
   * Refresh all indices.
   **/
  async refresh(index) {
    try {
      var params = {
        index: index || "_all"
      };

      let response = await this.client.indices.refresh(params);
      return response;
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }
  }

  /**
   * Create Index
   * @param {options} index settings and mappings
   */
  async createIndex(options) {
    logger.debug("elasticQuery createIndex");
    try {

      var params = Object.assign({
        body: options // {settings:..., mappings:...}
      }, this.elasticParams);
      //logger.debug(JSON.stringify(params));

      let response = await this.client.indices.create(params);
      return response;
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }
  }

  /**
   * Delete Index
   */
  async deleteIndex(indexName) {
    logger.debug("elasticQuery deleteIndex");

    try {
      var params = Object.assign({}, this.elasticParams);
      if (indexName) params.index = indexName;

      let response = await this.client.indices.delete(params);
      logger.debug("deleteIndex", response);
      return response;
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }
  }

  /**
   * Get Mappings
   */
  async getMapping() {
    logger.debug("elasticQuery getMapping");

    try {
      var params = Object.assign({}, this.elasticParams);
      //params.type = "_doc";

      let response = await this.client.indices.getMapping(params);
      logger.debug("getTemplate", response);
      let mappings = response[ params.index ].mappings._doc || response[ params.index ].mappings;
      return mappings;
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }
  }

  /**
   * Put Mappings
   * @param mappings template name
   */
  async putMapping(mappings) {
    logger.debug("elasticQuery putMapping");

    try {
      var params = Object.assign({
        body: mappings
      }, this.elasticParams);

      let response = await this.client.indices.putMapping(params);
      return response;
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }
  }

  /**
   * Get template
   * @param template_name template name
   */
  async getTemplate(template_name) {
    try {
      var params = {
        name: template_name
      };

      let response = await this.client.indices.getTemplate(params);
      logger.debug("getTemplate", response);
      return response[ template_name ];
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }
  }

  /**
   * Put template
   * @param template_name template name
   * @param template_doc template document
   */
  async putTemplate(template_name, template_doc) {
    try {

      var params = {
        order: 1,
        create: false,
        name: template_name,
        body: template_doc
      };

      let response = await this.client.indices.putTemplate(params);

      return response;
    }
    catch (error) {
      logger.debug(JSON.stringify(error.meta.body));
      throw error;
    }
  }

};
