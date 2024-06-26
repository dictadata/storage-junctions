const fs = require('node:fs');

const Aggregate = require('../../storage/transforms/aggregate.js');
var aggregate = new Aggregate({});
var aggregators;

var foo = fs.readFileSync("test/_data/input/foodata.json", { encoding: 'utf-8' });
var foodata = JSON.parse(foo);

var summary = {
  "__summary": {
    "totals": "totals",
    "count": "=count(item)",
    "qty": "=sum(quantity)",
    "value": "=sum(quantity*cost)"
  }
}
aggregators = {};
aggregate.accumulatorInit(summary, aggregators);
fs.writeFileSync("test/_data/output/aggregator/summary_init.json", JSON.stringify(aggregators,null,2));
for (construct of foodata)
  aggregate.accumulatorUpdate(aggregators, construct);
fs.writeFileSync("test/_data/output/aggregator/summary_data.json", JSON.stringify(aggregators, null, 2));

var groupby = {
  "category": {
    "count": "=count()",
    "qty": "=sum(quantity)",
    "value": "=sum(quantity*cost)"
  }
}
aggregators = {};
aggregate.accumulatorInit(groupby, aggregators);
fs.writeFileSync("test/_data/output/aggregator/groupby.json", JSON.stringify(aggregators,null,2));

var groupbysummary = {
  "category": {
    "count": "=count()",
    "qty": "=sum(quantity)",
    "value": "=sum(quantity*cost)"
  },
  "__summary": {
    "category": "totals",
    "count": "=count(item)",
    "qty": "=sum(quantity)",
    "value": "=sum(quantity*cost)"
  }
}
aggregators = {};
aggregate.accumulatorInit(groupbysummary, aggregators);
fs.writeFileSync("test/_data/output/aggregator/groupbysummary.json", JSON.stringify(aggregators,null,2));

var nested = {
  "category": {
    "item": {
      "count": "=count()",
      "qty": "=sum(quantity)",
      "value": "=sum(quantity*cost)"
    }
  }
}
aggregators = {};
aggregate.accumulatorInit(nested, aggregators);
fs.writeFileSync("test/_data/output/aggregator/nested.json", JSON.stringify(aggregators,null,2));

var nestedsummary = {
  "category": {
    "item": {
      "count": "=count()",
      "qty": "=sum(quantity)",
      "value": "=sum(quantity*cost)"
    },
    "__summary": {
      "item": "totals",
      "count": "=count(item)",
      "qty": "=sum(quantity)",
      "value": "=sum(quantity*cost)"
    }
  },
  "__summary": {
    "category": "totals",
    "count": "=count(item)",
    "qty": "=sum(quantity)",
    "value": "=sum(quantity*cost)"
  }
}
aggregators = {};
aggregate.accumulatorInit(nestedsummary, aggregators);
fs.writeFileSync("test/_data/output/aggregator/nestedsummary.json", JSON.stringify(aggregators,null,2));

var multiple = {
  "category": {
    "count": "=count()",
    "qty": "=sum(quantity)",
    "value": "=sum(quantity*cost)"
  },
  "item": {
    "count": "=count()",
    "qty": "=sum(quantity)",
    "value": "=sum(quantity*cost)"
  }
}
aggregators = {};
aggregate.accumulatorInit(multiple, aggregators);
fs.writeFileSync("test/_data/output/aggregator/multiple.json", JSON.stringify(aggregators,null,2));

var multiplesummary = {
  "category": {
    "count": "=count()",
    "qty": "=sum(quantity)",
    "value": "=sum(quantity*cost)"
  },
  "item": {
    "count": "=count()",
    "qty": "=sum(quantity)",
    "value": "=sum(quantity*cost)"
  },
  "__summary": {
    "totals": "totals",
    "count": "=count(item)",
    "qty": "=sum(quantity)",
    "value": "=sum(quantity*cost)"
  }
}
aggregators = {};
aggregate.accumulatorInit(multiplesummary, aggregators);
fs.writeFileSync("test/_data/output/aggregator/multiplesummary.json", JSON.stringify(aggregators,null,2));
