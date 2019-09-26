"use strict";

const logger = require("../logger");

module.exports = class ElasticRetriever {

  constructor(junction) {
    this.junction = junction;
    this.elastic = junction.elastic;

    this.pattern = {};

    this.dsl = {
      query: {}
    };
    this.size = -1;
    this.sort = null;

    this.constructs = [];
  }

  /**
   *
   * @param {*} pattern
   */
  async access(pattern) {
    console.log("elastic retrieval access");
    //console.log(this.junction._engram.schema);
    //console.log(pattern);
    this.pattern = pattern;

    try {
      this.filter();
      this.cues();
      this.consolidate();
      console.log(JSON.stringify(this.dsl));

      if (!pattern.consolidate) {
        let hits = await this.elastic.search(this.dsl);
        this.processHits(hits);
      } else {
        // aggregation results
        let aggs = await this.elastic.aggregate(this.dsl);
        this.processAggregations(aggs);
      }

      //console.log(this.constructs);
      return this.constructs;
    }
    catch(err) {
      logger.error(err.message);
      throw err;
    }
  }

  /**
   * query processing
   */

  filter() {
    let pattern = this.pattern;
    let dsl = this.dsl;

    if (!pattern.filter) {
      this.dsl.query["match_all"] = {};
      return;
    }

    let entries = Object.entries(pattern.filter);
    if (entries.length == 0) {
      dsl.query["match_all"] = {};
      return;
    }

    dsl.query["bool"] = {filter: []};
    for (const [name, value] of entries) {
      if (typeof value === 'object') {
        let q = {range: {}};
        let r = q.range[name] = {};
        if (value.gte) r["gte"] = value.gte;
        if (value.lte) r["lte"] = value.lte;
        dsl.query.bool.filter.push(q);
      } else {
        let q = {term: {}};
        q.term[name] = value;
        dsl.query.bool.filter.push(q);
      }
    }
  }

  cues() {
    let pattern = this.pattern;
    let dsl = this.dsl;

    if (pattern.cues) {
      // count
      if (typeof pattern.cues.count === 'number') {
        this.size = pattern.cues.count;
        if (!pattern.consolidate)
          dsl["size"] = this.size;
        else
          dsl["size"] = 0;
      }

      // order
      // pattern: "order": { "field_name": "desc" }
      // dsl: "sort" : { "field_name" : "desc" }
      if (pattern.cues.order) {
        this.sort = {};
        let entries = Object.entries(pattern.cues.order);
        for (const [name, direction] of entries) {
          this.sort[name] = direction;
        }
        if (!pattern.consolidate)
          dsl.sort = this.sort;
      }
    }

  }

  consolidate() {
    let pattern = this.pattern;
    let dsl = this.dsl;

    if (!pattern.consolidate) {
      return;
    }

    dsl["aggregations"] = this.aggregate(pattern.consolidate);
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
  aggregate(consolidate) {
    //console.log(consolidate);
    //let pattern = this.pattern;
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
          aggs[name+"_groupby"] = {
            terms: {field: name},
            aggregations: this.aggregate(expression)
          };
          if (this.sort)
            aggs[name+"_groupby"].terms.order = this.sort;
          if (this.size >= 0)
            aggs[name+"_groupby"].terms.size = this.size;
        } else {
          // summary operation
          let agg = {};
          agg[op] = {"field": fld};
          aggs[name] = agg;
        }
      }
    }
    return aggs;
  }

  /**
   * data return processing
   */

  processHits(hits) {
    //console.log("processHits");
    console.log("hits: " + hits.length);

    for (var i = 0; i < hits.length; i++) {
      this.constructs.push(hits[i]._source);
    }
  }

  processAggregations(aggs) {
    //console.log("processAggregations");
    //console.log(aggs);

    let entries = Object.entries(aggs);
    for (const [name, value] of entries) {
      if (!name.includes("_groupby")) {
        // summary
        let c = {};
        if (value.value_as_string)
          c[name] = value.value_as_string;
        else
          c[name] = value.value;
        this.constructs.push(c);
      } else {
        // group by
        let fieldname = name.substring(0,name.length-8);
        value.buckets.forEach(element => {
          let c = {};
          for (const [n,v] of Object.entries(element)) {
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
          this.constructs.push(c);
        });
      }
    }
  }

};
