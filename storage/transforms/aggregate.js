"use strict";

const { Transform } = require('node:stream');
const { logger } = require('@dictadata/lib');
const { typeOf, evaluate } = require('@dictadata/lib');

/* example aggregate transform
  // output format "{ "myField1": <value>, ..., "name1": <value1>, ... }
  {
    "transform": "aggregate",
    "fields": [
      {
        "_groupby": "myField1",
        "name1": "=sum(myField)",
        "name2": "=avg(myField)",
        "name3": "=min(myField)",
        "name4": "=max(myField)",
        "name5": "=var(myField)",
        "name6": "=stdev(myField)"
      },
      {
        "_groupby": [ "myField2", "myField3" ],
        "name1": "=sum(myField)",
        "name2": "=avg(myField)",
        "name3": "=min(myField)",
        "name4": "=max(myField)",
        "name5": "=var(myField)",
        "name6": "=stdev(myField)"
      },
      {
        "totals": "literal",
        "name1": "=sum(myField)",
        "name2": "=avg(myField)",
        "name3": "=min(myField)",
        "name4": "=max(myField)",
        "name5": "=var(myField)",
        "name6": "=stdev(myField)"
      }
    ]
  }
 */

// expression: "=this.func(evaluate)"
// evaluate: "field1 op field2"
// op: +-*/
var rx = new RegExp(/=([a-z]+)\((.+)\)/);

class Accumulator {

  constructor(expression) {
    this.expression = expression;
    let rxs = rx.exec(expression);
    if (rxs) {
      this.func = rxs[ 1 ];
      this.eval = "=" + rxs[ 2 ];

      this.count = 0;
      this.total = 0;
    }
  }

  update(construct) {
    if (!this.func)
      return;

    let value = evaluate(this.eval, construct);

    this.count++;
    if (this.func === "sum" || this.func === "avg")
      this.total += value;
    else if (this.func === "min") {
      if (this.min === undefined)
        this.min = value;
      else if (value < this.min)
        this.min = value;
    }
    else if (this.func === "max"){
      if (this.max === undefined)
        this.max = value;
      else if (value > this.max)
        this.max = value;
    }
    else if (this.func === "var" || this.func === "stdev") {
      if (this.mean === undefined) {
        this.mean = value;
        this.var = 0;
      }
      else {
        let m = this.mean;
        this.mean = this.mean + ((value - m) / this.count);
        this.var = this.var + (value - m) * (value - this.mean);
      }
    }
  }

  getValue() {
    switch (this.func) {
      case 'count':
        return this.count;
      case 'sum':
        return this.total;
      case 'avg':
        return this.count ? this.total / this.count : 0;
      case 'min':
        return this.min;
      case 'max':
        return this.max;
      case 'var':
        return this.var;
      case 'stdev':
        return Math.sqrt(this.var);
      default:
        return null;
    }
  }

}

function isValidKey(construct, field) {
  let value = construct[ field ];
  return (value !== undefined && value !== null && value !== "")
}

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

    this.aggregators = [];
  }

  _construct(callback) {
    logger.debug("AggregrateTransform _construct");
    this.accumulatorInit(this.options.fields, this.aggregators);
    callback();
  }

  _transform(construct, encoding, callback) {
    logger.debug("AggregrateTransform _transform");
    this.accumulatorUpdate(this.aggregators, construct);
    callback();
  }

  _flush(callback) {
    logger.debug("AggregrateTransform _flush");
    this.accumulatorOutput(this.aggregators);
    callback();
  }

  accumulatorInit(fields, aggregators) {

    for (let group of fields) {
      let agg = {};
      aggregators.push(agg);

      for (let [ field, expression ] of Object.entries(group)) {
        if (field === "_groupby") {
          agg._fields = Object.assign(group);
          if (typeof expression === "string")
            agg._fields._groupby = expression.split(",");
          agg._groups = new Map();
          break;
        }
        else {
          // summary accumulator
          if (expression && expression[ 0 ] === "=")
            agg[ field ] = new Accumulator(expression);
          else
            agg[ field ] = expression;
        }
      }
    }
  }

  accumulatorUpdate(aggregators, construct) {

    for (let agg of aggregators) {
      for (let [ name, value ] of Object.entries(agg)) {
        if (value instanceof Accumulator) {
          // summary accumulator
          value.update(construct);
        }
        else if (name === "_fields") {
          // get groupby values from construct
          let key = "";
          let keys = {};
          for (let field of value._groupby) {
            if (isValidKey(construct, field)) {
              key += field + construct[ field ];
              keys[ field ] = construct[ field ];
            }
            else {
              key = null;
              keys = null;
              break;
            }
          }

          if (!key)
            continue;

          // find object in agg._groups
          let group = agg._groups.get(key);
          if (group === undefined) {
            // create data group
            group = keys;
            for (let [ field, expression ] of Object.entries(agg._fields)) {
              if (field !== '_groupby') {
                if (expression && expression[ 0 ] === "=")
                  group[ field ] = new Accumulator(expression);
                else
                  group[ field ] = expression;
              }
            }
            agg._groups.set(key, group);
          }

          // update the data group
          for (let acc of Object.values(group))
            if (acc instanceof Accumulator) {
              acc.update(construct);
            }
        }
        else {
          // a literal field or _groups
        }
      }
    }
  }

  accumulatorOutput(aggregators, output = []) {

    for (let agg of aggregators) {
      if (Object.hasOwn(agg, "_groups")) {
        for (let group of agg._groups.values()) {
          let construct = {};

          for (let [ name, value ] of Object.entries(group)) {
            if (value instanceof Accumulator)
              construct[ name ] = value.getValue();
            else
              construct[ name ] = value;
          }

          if (Object.keys(construct).length > 0) {
            output.push(construct);
            this.push(construct);
          }
        }
      }
      else {
        let construct = {};

        for (let [ name, value ] of Object.entries(agg)) {
          if (value instanceof Accumulator)
            construct[ name ] = value.getValue();
          else
            construct[ name ] = value;
        }

        if (Object.keys(construct).length > 0) {
          output.push(construct);
          this.push(construct);
        }
      }

    }

    return output;
  }

};
