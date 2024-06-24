"use strict";

const { Transform } = require('node:stream');
const { logger } = require('@dictadata/lib');
const { typeOf, evaluate } = require('@dictadata/lib');

/* example aggregate transform
  // output format "{ "myField1": <value>, ..., "name1": <value1>, ... }
  {
    "transform": "aggregate",
    "fields": {
      "myField1": {
        "name1": "=sum(myField)",
        "name2": "=avg(myField)",
        "name3": "=min(myField)",
        "name4": "=max(myField)",
        "name5": "=var(myField)",
        "name6": "=stdev(myField)"
      },
      "myField2": {
        "myField3": {
          ...
          "name1": "=sum(myField)",
          "name2": "=avg(myField)",
          "name3": "=min(myField)",
          "name4": "=max(myField)",
          "name5": "=var(myField)",
          "name6": "=stdev(myField)"
        }
        ...
      },
      ...,
      "__summary": {
        "myField": "literal",
        "name1": "=sum(myField)",
        "name2": "=avg(myField)",
        "name3": "=min(myField)",
        "name4": "=max(myField)",
        "name5": "=var(myField)",
        "name6": "=stdev(myField)"
      }
    }
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

    this.fields = {};  // accumulators
  }

  _construct(callback) {
    logger.debug("AggregrateTransform _construct");
    this.accumulatorInit(this.options.fields, this.fields);
    callback();
  }

  _transform(construct, encoding, callback) {
    logger.debug("AggregrateTransform _transform");
    this.accumulatorUpdate(this.fields, construct);
    callback();
  }

  _flush(callback) {
    logger.debug("AggregrateTransform _flush");
    this.accumulatorOutput(this.fields, this.accumulator);
    callback();
  }

  accumulatorInit(fields, accumulators) {

    for (let [ name, value ] of Object.entries(fields)) {
      if (typeof value === "object") {
        accumulators[ name ] = {};
        this.accumulatorInit(value, accumulators[ name ]);
      }
      else {
        accumulators[ name ] = new Accumulator(value);
      }
    }
  }

  accumulatorUpdate(fields, construct) {

    for (let [ name, value ] of Object.entries(fields)) {
      if (value instanceof Accumulator)
        value.update(construct);
      else
        this.accumulatorUpdate(value, construct);
    }
  }

  accumulatorOutput(fields) {
    let construct = {};

    for (let [ name, value ] of Object.entries(fields)) {
      if (value instanceof Accumulator)
        construct[ name ] = value.getValue();
      else
        this.accumulatorOutput(value);
    }

    if (Object.keys(construct).length > 0)
      this.push(construct);
  }

};
