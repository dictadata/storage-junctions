/**
 * elasticsearch/encoder_dsl
 */
"use strict";

const { logger } = require('@dictadata/lib');
const { typeOf, isDate, parseDate } = require('@dictadata/lib');
const { StorageError } = require('../../types');

exports.encodeValues = function (engram, construct) {
  let data = {};

  for (let [ name, value ] of Object.entries(construct)) {
    let field = engram.find(name);
    switch (field.type.toLowerCase()) {
      case "date":
        let dt = value;
        if (typeof value === "string")
          dt = (isDate(value) === 1) ? parseDate(value) : new Date(dt);
        data[ name ] = dt;
        break;
      case "boolean":
        data[ name ] = !!value;
        break;
      case "binary":
        data[ name ] = null;   // to do figure out how to pass buffers
        break;
      default:
        data[ name ] = value;
    }
  }

  return data;
};

/**
 *
 * @param {*} pattern Should contain a match member to be translated to an Elasticsearch DSL query
 */
exports.matchQuery = function (keys, pattern) {
  logger.debug("elasticEncoder matchQuery");
  pattern = pattern || {};

  try {
    var dsl = {
      query: {},
      size: 1
    };

    match(dsl, pattern);

    logger.debug("dsl: " + JSON.stringify(dsl));
    return dsl;
  }
  catch (err) {
    let sterr = StorageError(err);
    logger.warn(sterr);
    throw sterr;
  }
};

/**
 *
 * @param {*} pattern The match, fields, order, etc used to create an Elasticsearch DSL query
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
    aggregate(dsl, pattern);  // aggregations

    logger.debug("dsl: " + JSON.stringify(dsl));
    return dsl;
  }
  catch (err) {
    let sterr = StorageError(err);
    logger.warn(sterr);
    throw sterr;
  }
};

function match(dsl, pattern) {
  const match = pattern?.match || {};

  if (Object.keys(match).length <= 0) {
    dsl.query[ "match_all" ] = {};
    return;
  }

  let entries = Object.entries(match);
  if (entries.length == 0) {
    dsl.query[ "match_all" ] = {};
    return;
  }

  dsl.query[ "bool" ] = {
    filter: [],
    must_not: []
  };
  let filter = dsl.query.bool.filter;
  let must_not = dsl.query.bool.must_not;

  for (const [ fldname, value ] of entries) {
    if (typeOf(value) === 'object') {
      // a complex expression
      let keys = Object.keys(value);

      if ([ 'contains', 'within', 'intersect', 'disjoint' ].includes(keys[ 0 ])) {
        // geo_shape query
        let q = {
          "geo_shape": {}
        };
        q.geo_shape[ fldname ] = {
          "shape": {
            "type": keys[ 0 ] === "contains" ? "point" : "polygon",
            "coordinates": value[ keys[ 0 ] ]
          },
          "relation": keys[ 0 ]
        };

        filter.push(q);
      }
      else if (keys[ 0 ] === 'wc') {
        // wildcard query
        let exp = value;
        let q = {
          wildcard: {}
        };
        q.wildcard[ fldname ] = { "value": exp.wc };
        filter.push(q);
      }
      else if (keys[ 0 ] === 'search') {
        // full-text search query
        let exp = value;
        let q = {};

        if (exp.fields) {
          // note: fldname from parent node is ignored
          q[ "multi_match" ] = {};
          q.multi_match[ "query" ] = exp.search;
          q.multi_match[ "fields" ] = exp.fields;
          if ('op' in exp) {
            if (exp.op === "phrase")
              q.multi_match[ "type" ] = "phrase";
            else
              q.multi_match[ "operator" ] = exp.op;
          }
        }
        else if (exp.op === "phrase") {
          q[ "match_phrase" ] = {};
          q.match_phrase[ fldname ] = { "query": exp.search };
        }
        else {
          q[ "match" ] = {};
          q.match[ fldname ] = { "query": exp.search };
          if ('op' in exp)
            q.match[ fldname ][ "operator" ] = exp.op;
        }

        filter.push(q);
      }
      else {
        // expression(s) { op: value, ...}
        let q = {};
        let exp = value;

        if ('eq' in exp || 'in' in exp) {
          q.term = {};
          q.term[ fldname ] = exp.eq || exp.in;
          filter.push(q);
        }
        else if ('neq' in exp) {
          q.term = {};
          q.term[ fldname ] = exp.neq;
          must_not.push(q);
        }
        else if ('exists' in exp) {
          q.exists = { field: fldname };
          if (exp.exists)
            filter.push(q);
          else
            must_not.push(q);
        }
        else {
          q[ "range" ] = {};
          let rf = q.range[ fldname ] = {};
          if ('gt' in exp) rf[ "gt" ] = exp.gt;
          if ('gte' in exp) rf[ "gte" ] = exp.gte;
          if ('lt' in exp) rf[ "lt" ] = exp.lt;
          if ('lte' in exp) rf[ "lte" ] = exp.lte;
          if (Object.keys(rf).length > 0)
            filter.push(q);
        }
      }
    }
    else if (typeOf(value) === "array") {
      // mulitiple values { field: [value1, value2, ...] }
      let q = {
        terms: {}
      };
      q.terms[ fldname ] = value;
      filter.push(q);
    }
    else {
      // single value { field: value }
      let q = {
        term: {}
      };
      q.term[ fldname ] = value;
      filter.push(q);
    }
  }
}

function cues(dsl, pattern) {

  // count
  if (pattern?.count) {
    if (pattern?.aggregate)
      dsl[ "size" ] = 0;  // no _source in results
    else
      dsl[ "size" ] = pattern.count || 100;
  }

  // fields
  // pattern: { "fields": [ "field_name", ... ] }
  // dsl: "_source" : [ "field_name", ...]
  if (pattern?.fields) {
    dsl._source = pattern.fields;
  }

  // order
  // pattern: { "order": { "field_name": "desc" } }
  // dsl: "sort" : { "field_name" : "desc" }
  if (pattern?.order && !pattern?.aggregate) {
    dsl.sort = {};
    for (const [ name, direction ] of Object.entries(pattern.order)) {
      dsl.sort[ name ] = direction;
    }
  }

}

function aggregate(dsl, pattern) {

  if (!pattern?.aggregate) {
    return;
  }

  dsl[ "aggregations" ] = aggregateQuery(pattern.aggregate, (pattern || {}));
}

/*
  aggregate summary:
  "mySum": { "sum": "price" }

  DSL:
  "mySum": { "sum": { "field": "price" } }

  aggregate group by:
  "product": { "prodSum": { "sum": "price" } }

  DSL:
  "product_groupby": {
    "terms": {
      "field": "product"
    },
    "aggregations": {
      "prodSum": { "sum": { "field": "price" } }
    }
  }
*/

/**
 * aggregate
 * Note, this function is recursive.
 * @param {*} aggregate
 * @param {*} cues
 */
function aggregateQuery(aggregate, cues) {
  logger.debug("aggregate: " + JSON.stringify(aggregate));

  let aggs = {};

  let entries = Object.entries(aggregate);
  if (entries.length == 0) {
    return aggs;
  }

  for (const [ newName, expression ] of entries) {
    if (typeOf(expression) !== 'object')
      throw "bad aggregate expression";

    let exp = Object.entries(expression);
    for (let [ op, fld ] of exp) {
      op = elasticFunction(op);
      if (typeOf(fld) === 'object') {
        // group by
        aggs[ newName + "_groupby" ] = {
          terms: { field: newName },
          aggregations: aggregateQuery(expression, cues)
        };
        if (cues.order)
          aggs[ newName + "_groupby" ].terms.order = cues.order;
        if (cues.count)
          aggs[ newName + "_groupby" ].terms.size = cues.count;
      } else {
        // summary operation
        let agg = {};
        agg[ op ] = { "field": fld };
        aggs[ newName ] = agg;
      }
    }
  }

  return aggs;
}

function elasticFunction(op) {
  switch (op.toLowerCase()) {
    case 'sum': return 'sum';
    case 'avg': return 'avg';
    case 'min': return 'min';
    case 'max': return 'max';
    case 'count': return 'value_count';
    default: return op;
  }
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
  for (const [ name, value ] of entries) {
    if (name.includes("_groupby")) {
      // group by
      let fieldname = name.substring(0, name.length - 8);

      value.buckets.forEach((element) => {
        let group = {};
        for (const [ n, v ] of Object.entries(element)) {
          if (n === "key_as_string")
            group[ fieldname ] = element.key_as_string;
          else if (n === "key")
            group[ fieldname ] = element.key;
          else if (n === "doc_count")
            group[ "count" ] = element.doc_count;
          else {
            if (v.value_as_string)
              group[ n ] = v.value_as_string;
            else
              group[ n ] = v.value;
          }
        }
        constructs.push(group);
      });

    } else {
      // summary
      if (value.value_as_string)
        summary[ name ] = value.value_as_string;
      else
        summary[ name ] = value.value;
    }
  }

  if (Object.keys(summary).length > 0)
    constructs.push(summary);

  return constructs;
};
