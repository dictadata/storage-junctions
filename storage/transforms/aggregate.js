"use strict";

const { Transform } = require('stream');
const { typeOf, hasOwnProperty, logger } = require("../utils");

/*
 TBD
   fix issue with csv and json aggregate group by. Not accumulating on other fields.

   {
      transform: "aggregate",

      fields: {
        "Foo": {
          "aggField": { "sum": "Baz" },
          "count": { "count": "Baz" },
          "dt_min": { "min": "Dt Test" },   <---
          "dt_max": { "max": "Dt Test" }    <---
        }
      }
    }
 */

/*
  // example aggregate transform
  // - newField1 = summary total for field1
  // - newField2 = [] grouped on field2 and calculate sum of field3 for each unique value of field2
  {
    transform: "aggregate",

    "fields": {
      "aggField1": {"sum": "field1},
      "field2": {"aggField2": { "sum": "field3" } }
    }
  };
*/

module.exports = exports = class AggregateTransform extends Transform {

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

    this.options = Object.assign({}, options);

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
    logger.debug("AggregrateTransform _transform");

    let fields = this.options.fields || [];

    for (let [newfld,exp] of Object.entries(fields)) {
      for (let [func,fld] of Object.entries(exp)) {
        if (typeOf(fld) === "object") {
          // group by aggregation functions
          let groupby = newfld;  // group by field name
          newfld = func;
          let exp = fld;

          // check to create group
          if (!hasOwnProperty(this.groups, groupby))
            this.groups[groupby] = {};

          if (hasOwnProperty(construct, groupby)) {
            let groupby_value = construct[groupby];

            // check to create groupby_value group
            if (!hasOwnProperty(this.groups[groupby], groupby_value))
              this.groups[groupby][groupby_value] = {};

            // groupby expressions
            for (let [func,fld] of Object.entries(exp)) {
              if (hasOwnProperty(construct, fld)) {
                let value = construct[fld];
                // check to create accumulator
                if (!hasOwnProperty(this.groups[groupby][groupby_value], fld))
                  this.groups[groupby][groupby_value][fld] = {count: 0, total: 0};
                this.accumulatorUpdate(this.groups[groupby][groupby_value][fld], value);
              }
            }
          }
        }
        else {
          // totals for aggregation functions
          if (hasOwnProperty(construct, fld)) {
            let value = construct[fld];
            // check to create accumulator
            if (!hasOwnProperty(this.accumulator, fld))
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
    if (!hasOwnProperty(accumulator, "min"))
      accumulator.min = value;
    else if (value < accumulator.min)
      accumulator.min = value;
    if (!hasOwnProperty(accumulator, "max"))
      accumulator.max = value;
    else if (value > accumulator.max)
      accumulator.max = value;
  }

  accumulatorValue(accumulator, func) {
    switch (func) {
      case 'sum':
        return accumulator.total;
      case 'avg':
        return accumulator.count ? accumulator.total / accumulator.count : 0;
      case 'min':
        return accumulator.min;
      case 'max':
        return accumulator.max;
      case 'count':
        return accumulator.count;
      default:
        return 0;
    }
  }

  /* optional */
  _flush(callback) {
    // output summary and groupby summaries
    let summary = {};

    let fields = this.options.fields || [];

    for (let [ newfld, exp ] of Object.entries(fields)) {
      for (let [ func, fld ] of Object.entries(exp)) {

        if (typeOf(fld) === "object") {
          // group by aggregation functions
          let groupby = newfld;
          newfld = func;
          let exp = fld;

          // loop through accumulator groupby_value's
          for (let [groupby_value,group] of Object.entries(this.groups[groupby])) {
            let summary = {};
            summary[groupby] = groupby_value;

            for (let [func,fld] of Object.entries(exp)) {
              if (hasOwnProperty(group, fld)) {
                let accumulator = this.groups[groupby][groupby_value][fld];
                summary[newfld] = this.accumulatorValue(accumulator, func);
              }
            }
            this.push(summary);
          }
        }
        else {
          // overall summary
          if (hasOwnProperty(this.accumulator, fld)) {
            summary[newfld] = this.accumulatorValue(this.accumulator[fld], func);
          }
        }

      }
    }

    if (Object.keys(summary).length > 0)
      this.push(summary);

    callback();
  }

};
