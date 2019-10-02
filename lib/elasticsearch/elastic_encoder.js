"use strict";

const logger = require('../logger');

/**
 *
 * @param {*} options options.pattern the storage pattern to transform into a Elasticsearch DSL query
 */
exports.matchQuery = function (keys, options) {
  logger.debug("elasticEncoder matchQuery");

  try {
    var dsl = {
      query: {},
      size: 1
    };

    // get just key values from options
    let kv = {};
    for (let key of keys) {
      kv[key] = options[key];
    }

    filter(dsl, kv);

    logger.debug(JSON.stringify(dsl));
    return dsl;
  }
  catch (err) {
    logger.error(err.message);
    throw err;
  }
};

/**
 *
 * @param {*} options options.pattern the storage pattern to transform into a Elasticsearch DSL query
 */
exports.searchQuery = function (pattern) {
  logger.debug("elasticEncoder searchQuery");
  logger.debug(pattern);

  pattern._size = -1;
  pattern._sort = null;

  try {
    var dsl = {
      query: {}
    };

    filter(dsl, pattern);
    cues(dsl, pattern);
    consolidate(dsl, pattern);  // aggregations

    logger.debug(JSON.stringify(dsl));
    return dsl;
  }
  catch (err) {
    logger.error(err.message);
    throw err;
  }
};

function filter(dsl, pattern) {
  let filter = pattern.fitler;

  if (!filter) {
    dsl.query["match_all"] = {};
    return;
  }

  let entries = Object.entries(filter);
  if (entries.length == 0) {
    dsl.query["match_all"] = {};
    return;
  }

  dsl.query["bool"] = { filter: [] };
  for (const [name, value] of entries) {
    if (typeof value === 'object') {
      let q = { range: {} };
      let r = q.range[name] = {};
      if (value.gt) r["gt"] = value.gte;
      if (value.gte) r["gte"] = value.lte;
      if (value.lt) r["lt"] = value.gte;
      if (value.lte) r["lte"] = value.lte;
      if (value.eq) r["eq"] = value.gte;
      if (value.neq) r["neq"] = value.lte;
      dsl.query.bool.filter.push(q);
    } else {
      let q = { term: {} };
      q.term[name] = value;
      dsl.query.bool.filter.push(q);
    }
  }
}

function cues(dsl, pattern) {

  if (pattern.cues) {
    // count
    if (typeof pattern.cues.count === 'number') {
      pattern._size = pattern.cues.count;
      if (!pattern.consolidate)
        dsl["size"] = pattern._size;
      else
        dsl["size"] = 0;
    }

    // fields
    // pattern.cues: "fields": [ "field_name", ... ]
    // dsl: "_source" : [ "field_name", ...]
    if (pattern.cues.fields) {
      dsl._source = pattern.cues.fields;
    }

    // order
    // pattern.cues: "order": { "field_name": "desc" }
    // dsl: "sort" : { "field_name" : "desc" }
    if (pattern.cues.order) {
      pattern._sort = {};
      for (const [name, direction] of Object.entries(pattern.cues.order)) {
        pattern._sort[name] = direction;
      }
      if (!pattern.consolidate)
        dsl.sort = pattern._sort;
    }
  }

}

function consolidate(dsl, pattern) {

  if (!pattern.consolidate) {
    return;
  }

  dsl["aggregations"] = aggregate(pattern.consolidate, { size: pattern._size, sort: pattern._sort });
}

/*
  pattern:
  "invoice_price_sum": { "sum": "invoice_price" }

  dsl:
  "invoice_price_sum": { "sum": { "field": "invoice_price" } }

  pattern:
  "repair_code": { "invoice_price_sum": { "sum": "invoice_price" } }

  dsl:
  "repair_code_groupby": {
    "terms": {
      "field": "repair_code"
    },
    "aggregations": {
      "invoice_price_sum": { "sum": { "field": "invoice_price" } }
    }
  }
*/

function aggregate(consolidate, options) {
  logger.debug(consolidate);

  let aggs = {};

  let entries = Object.entries(consolidate);
  if (entries.length == 0) {
    return aggs;
  }

  for (const [name, expression] of entries) {
    if (typeof expression !== 'object')
      throw "bad consolidate expression";

    let exp = Object.entries(expression);
    for (const [op, fld] of exp) {
      if (typeof fld === 'object') {
        // group by
        aggs[name + "_groupby"] = {
          terms: { field: name },
          aggregations: aggregate(expression, options)
        };
        if (options.sort)
          aggs[name + "_groupby"].terms.order = options.sort;
        if (options.size >= 0)
          aggs[name + "_groupby"].terms.size = options.size;
      } else {
        // summary operation
        let agg = {};
        agg[op] = { "field": fld };
        aggs[name] = agg;
      }
    }
  }

  return aggs;
}

/**
 * return aggregation results as an array of constructs
 */
exports.processAggregations = function (aggs) {
  logger.debug("processAggregations");
  logger.debug(aggs);

  let constructs = [];

  let entries = Object.entries(aggs);
  for (const [name, value] of entries) {
    if (!name.includes("_groupby")) {
      // summary
      let c = {};
      if (value.value_as_string)
        c[name] = value.value_as_string;
      else
        c[name] = value.value;
      constructs.push(c);
    } else {
      // group by
      let fieldname = name.substring(0, name.length - 8);
      value.buckets.forEach(element => {
        let c = {};
        for (const [n, v] of Object.entries(element)) {
          if (n === "key")
            c[fieldname] = element.key;
          else if (n === "doc_count")
            c["count"] = element.doc_count;
          else {
            if (v.value_as_string)
              c[n] = v.value_as_string;
            else
              c[n] = v.value;
          }
        }
        constructs.push(c);
      });
    }
  }

  return constructs;
};
