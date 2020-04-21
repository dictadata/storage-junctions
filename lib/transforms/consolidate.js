"use strict";

const { Transform } = require('stream');
const { StorageError } = require("../types");
const logger = require('../logger');

const dot = require('dot-object');

/*
  // example consolidate transform
  // - summary total for field1
  // - group on field2 and calculate sum of field3 for each unique field2 value
  // - the final output of the transform contians properties for newField1 and newField2
  transforms: {
    consolidate: {
      "newField1": {"sum": "field1},
      "newfield2": {"field2": { "sum": "field3" } }
    }
  };
*/

module.exports = exports = class ConsolidateTransform extends Transform {

  /**
   *
   * @param {*} options transform options
   */
  constructor(options) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 128
    };
    super(streamOptions);

    this.options = options;

    this.accumulator = {};  // accumulator for totals
    this.groups = {};  // accumulators for groupby totals
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(construct, encoding, callback) {
    let consolidate = this.options.consolidate;

    for (let [newfld,exp] of Object.entries(consolidate)) {
      for (let [func,fld] of Object.entries(exp)) {
        if (typeof fld === "object") {
          // group by aggregation functions
          let groupby = func;  // group by field name
          // check to create group
          if (!Object.prototype.hasOwnProperty.call(this.groups, groupby))
            this.groups[groupby] = {};

          if (Object.prototype.hasOwnProperty.call(construct, groupby)) {
            let groupby_value = construct[groupby];

            // check to create groupby_value group
            if (!Object.prototype.hasOwnProperty.call(this.groups[groupby], groupby_value))
              this.groups[groupby][groupby_value] = {};

            // groupby expressions
            for (let [func,fld] of Object.entries(fld)) {
              if (Object.prototype.hasOwnProperty.call(construct, fld)) {
                let value = construct[fld];
                // check to create accumulator
                if (!Object.prototype.hasOwnProperty.call(this.groups[groupby][groupby_value], fld))
                  this.groups[groupby][groupby_value][fld] = {count: 0, total: 0};
                this.accumulatorUpdate(this.groups[groupby][groupby_value][fld], value);
              }
            }
          }
        }
        else {
          // totals for aggregation functions
          if (Object.prototype.hasOwnProperty.call(construct, fld)) {
            let value = construct[fld];
            // check to create accumulator
            if (!Object.prototype.hasOwnProperty.call(this.accumulator, fld))
              this.accumulator[fld] = {count: 0, total: 0};
            this.accumulatorUpdate(this.accumulator[fld], value);
          }
        }
      }
    }

    callback();
  }

  accumulatorUpdate(accumulator, value) {
    accumulator.count++;
    accumulator.total += value;
    if (!Object.prototype.hasOwnProperty.call(accumulator, "min"))
      accumulator.min = value;
    else if (value > accumulator.min)
      accumulator.min = value;
    if (!Object.prototype.hasOwnProperty.call(accumulator, "max"))
      accumulator.max = value;
    else if (value < accumulator.max)
      accumulator.max = value;
  }

  accumulatorValue(accumulator, func) {
    switch (func) {
      case 'sum': return accumulator.total;
      case 'avg': return accumulator.count ? accumulator / accumulator.count : 0;
      case 'min': return accumulator.min;
      case 'max': return accumulator.max;
      case 'count': return accumulator.count;
      default: return 0;
    }
  }

  /* optional */
  _flush(callback) {
    // output summary and groupby summaries
    for (let [newfld,exp] of Object.entries(this.options.consolidate)) {
      let summary = {};

      for (let [func,fld] of Object.entries(exp)) {
        if (typeof fld === "object") {
          // group by aggregation functions
          let groupby = func;  // group by field name

          // loop through accumulator groupby_value's
          for (let [groupby_value,group] of Object.entries(this.groups[groupby])) {
            let summary = {};
            summary[groupby] = groupby_value;

            for (let [func,fld] of Object.entries(fld)) {
              if (Object.prototype.hasOwnProperty.call(group, fld)) {
                let accumulator = this.groups[groupby][groupby_value][fld];
                summary[newfld] = this.accumulatorValue(accumulator, func);
              }
            }
            this.push(summary);
          }
        }
        else {
          // overall summary
          if (Object.prototype.hasOwnProperty.call(this.accumulator, fld)) {
            summary[newfld] = this.accumulatorValue(this.accumulator[fld], func);
          }
        }
      }

      if (Object.keys(summary).length > 0)
        this.push(summary);
    }

    callback();
  }

};
