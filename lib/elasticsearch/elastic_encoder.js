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

    match(dsl, kv);

    logger.debug("dsl: " + JSON.stringify(dsl));
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
  logger.debug("pattern: " + JSON.stringify(pattern));

  try {
    var dsl = {
      query: {}
    };

    match(dsl, pattern);
    cues(dsl, pattern);
    consolidate(dsl, pattern);  // aggregations

    logger.debug("dsl: " + JSON.stringify(dsl));
    return dsl;
  }
  catch (err) {
    logger.error(err.message);
    throw err;
  }
};

function match(dsl, pattern) {
  let match = pattern.match;

  if (!match) {
    dsl.query["match_all"] = {};
    return;
  }

  let entries = Object.entries(match);
  if (entries.length == 0) {
    dsl.query["match_all"] = {};
    return;
  }

  dsl.query["bool"] = { filter: [] };
  for (const [name, value] of entries) {
    if (typeof value === 'object') {
      let q = { range: {} };
      let r = q.range[name] = {};
      if ('gt' in value)  r["gt"]  = value.gt;
      if ('gte' in value) r["gte"] = value.gte;
      if ('lt' in value)  r["lt"]  = value.lt;
      if ('lte' in value) r["lte"] = value.lte;
      if ('eq' in value)  r["eq"]  = value.eq;
      if ('neq' in value) r["neq"] = value.neq;
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
    if (pattern.cues.count) {
      if (pattern.consolidate)
        dsl["size"] = 0;  // no _source in results
      else
        dsl["size"] = pattern.cues.count || 100;
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
    if (pattern.cues.order && !pattern.consolidate) {
      dsl.sort = {};
      for (const [name, direction] of Object.entries(pattern.cues.order)) {
        dsl.sort[name] = direction;
      }
    }
  }

}

function consolidate(dsl, pattern) {

  if (!pattern.consolidate) {
    return;
  }

  dsl["aggregations"] = aggregate(pattern.consolidate, cues);
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

/**
 * aggregate
 * Note, this function is recursive.
 * @param {*} consolidate
 * @param {*} cues
 */
function aggregate(consolidate, cues) {
  logger.debug("consolidate: " + JSON.stringify(consolidate));

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
          aggregations: aggregate(expression, cues)
        };
        if (cues.order)
          aggs[name + "_groupby"].terms.order = cues.order;
        if (cues.count)
          aggs[name + "_groupby"].terms.size = cues.count;
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
  logger.debug("aggregations: " + JSON.stringify(aggs));

  let constructs = [];  // return data
  let summary = {};     // summary aggregate values

  let entries = Object.entries(aggs);
  for (const [name, value] of entries) {
    if (name.includes("_groupby")) {
      // group by
      let fieldname = name.substring(0, name.length - 8);

      value.buckets.forEach(element => {
        let group = {};
        for (const [n, v] of Object.entries(element)) {
          if (n === "key")
            group[fieldname] = element.key;
          else if (n === "doc_count")
            group["count"] = element.doc_count;
          else {
            if (v.value_as_string)
              group[n] = v.value_as_string;
            else
              group[n] = v.value;
          }
        }
        constructs.push(group);
      });

    } else {
      // summary
      if (value.value_as_string)
        summary[name] = value.value_as_string;
      else
        summary[name] = value.value;
    }
  }
  if (Object.keys(summary).length > 0)
    constructs.push(summary);

  return constructs;
};
