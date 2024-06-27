const fs = require('node:fs');

const Aggregate = require('../../storage/transforms/aggregate.js');
var aggregate = new Aggregate({});
var aggregators;

var foo = fs.readFileSync("test/_data/input/foo_data.json", { encoding: 'utf-8' });
var foo_data = JSON.parse(foo);
var output;

console.log("summary");
var summary = [ {
  "totals": "totals",
  "count": "=count(item)",
  "qty": "=sum(quantity)",
  "value": "=sum(quantity*cost)"
} ]
aggregators = [];
aggregate.accumulatorInit(summary, aggregators);
fs.writeFileSync("test/_data/output/aggregate/summary_init.json", JSON.stringify(aggregators, null, 2));
for (construct of foo_data)
  aggregate.accumulatorUpdate(aggregators, construct);
fs.writeFileSync("test/_data/output/aggregate/summary_data.json", JSON.stringify(aggregators, null, 2));
output = aggregate.accumulatorOutput(aggregators);
fs.writeFileSync("test/_data/output/aggregate/summary_output.json", JSON.stringify(output, null, 2));

console.log("groupby");
var groupby = [ {
  "_groupby": "category",
  "count": "=count(category)",
  "qty": "=sum(quantity)",
  "value": "=sum(quantity*cost)"
} ]
aggregators = [];
aggregate.accumulatorInit(groupby, aggregators);
fs.writeFileSync("test/_data/output/aggregate/groupby_init.json", JSON.stringify(aggregators, null, 2));
for (construct of foo_data)
  aggregate.accumulatorUpdate(aggregators, construct);
fs.writeFileSync("test/_data/output/aggregate/groupby_data.json", JSON.stringify(aggregators, null, 2));
output = aggregate.accumulatorOutput(aggregators);
fs.writeFileSync("test/_data/output/aggregate/groupby_output.json", JSON.stringify(output, null, 2));

console.log("groupbysummary");
var groupbysummary = [ {
  "_groupby": "category",
  "count": "=count(category)",
  "qty": "=sum(quantity)",
  "value": "=sum(quantity*cost)"
},
{
  "category": "totals",
  "count": "=count(item)",
  "qty": "=sum(quantity)",
  "value": "=sum(quantity*cost)"
} ]
aggregators = [];
aggregate.accumulatorInit(groupbysummary, aggregators);
fs.writeFileSync("test/_data/output/aggregate/groupbysummary_init.json", JSON.stringify(aggregators, null, 2));
for (construct of foo_data)
  aggregate.accumulatorUpdate(aggregators, construct);
fs.writeFileSync("test/_data/output/aggregate/groupbysummary_data.json", JSON.stringify(aggregators, null, 2));
output = aggregate.accumulatorOutput(aggregators);
fs.writeFileSync("test/_data/output/aggregate/groupbysummary_output.json", JSON.stringify(output, null, 2));

console.log("nested");
var nested = [ {
  "_groupby": [ "category", "item" ],
  "count": "=count(item)",
  "qty": "=sum(quantity)",
  "value": "=sum(quantity*cost)"
} ]
aggregators = [];
aggregate.accumulatorInit(nested, aggregators);
fs.writeFileSync("test/_data/output/aggregate/nested_init.json", JSON.stringify(aggregators, null, 2));
for (construct of foo_data)
  aggregate.accumulatorUpdate(aggregators, construct);
fs.writeFileSync("test/_data/output/aggregate/nested_data.json", JSON.stringify(aggregators, null, 2));
output = aggregate.accumulatorOutput(aggregators);
fs.writeFileSync("test/_data/output/aggregate/nested_output.json", JSON.stringify(output, null, 2));

console.log("nestedsummary");
var nestedsummary = [ {
  "_groupby": [ "category", "item" ],
  "count": "=count(item)",
  "qty": "=sum(quantity)",
  "value": "=sum(quantity*cost)"
},
{
  "_groupby": "category",
  "item": "subtotal",
  "count": "=count(category)",
  "qty": "=sum(quantity)",
  "value": "=sum(quantity*cost)"
},
{
  "category": "totals",
  "item": "totals",
  "count": "=count(category)",
  "qty": "=sum(quantity)",
  "value": "=sum(quantity*cost)"
} ]
aggregators = [];
aggregate.accumulatorInit(nestedsummary, aggregators);
fs.writeFileSync("test/_data/output/aggregate/nestedsummary_init.json", JSON.stringify(aggregators, null, 2));
for (construct of foo_data)
  aggregate.accumulatorUpdate(aggregators, construct);
fs.writeFileSync("test/_data/output/aggregate/nestedsummary_data.json", JSON.stringify(aggregators, null, 2));
output = aggregate.accumulatorOutput(aggregators);
fs.writeFileSync("test/_data/output/aggregate/nestedsummary_output.json", JSON.stringify(output, null, 2));

console.log("multiple");
var multiple = [ {
  "_groupby": "category",
  "count": "=count(category)",
  "qty": "=sum(quantity)",
  "value": "=sum(quantity*cost)"
},
{
  "_groupby": "item",
  "count": "=count(item)",
  "qty": "=sum(quantity)",
  "value": "=sum(quantity*cost)"
} ]
aggregators = [];
aggregate.accumulatorInit(multiple, aggregators);
fs.writeFileSync("test/_data/output/aggregate/multiple_init.json", JSON.stringify(aggregators, null, 2));
for (construct of foo_data)
  aggregate.accumulatorUpdate(aggregators, construct);
fs.writeFileSync("test/_data/output/aggregate/multiple_data.json", JSON.stringify(aggregators, null, 2));
output = aggregate.accumulatorOutput(aggregators);
fs.writeFileSync("test/_data/output/aggregate/multiple_output.json", JSON.stringify(output, null, 2));

console.log("multiplesummary");
var multiplesummary = [ {
  "_groupby": "category",
  "count": "=count(category)",
  "qty": "=sum(quantity)",
  "value": "=sum(quantity*cost)"
},
{
  "_groupby": "item",
  "count": "=count(item)",
  "qty": "=sum(quantity)",
  "value": "=sum(quantity*cost)"
},
{
  "totals": "totals",
  "count": "=count(category)",
  "qty": "=sum(quantity)",
  "value": "=sum(quantity*cost)"
} ]
aggregators = [];
aggregate.accumulatorInit(multiplesummary, aggregators);
fs.writeFileSync("test/_data/output/aggregate/multiplesummary_init.json", JSON.stringify(aggregators, null, 2));
for (construct of foo_data)
  aggregate.accumulatorUpdate(aggregators, construct);
fs.writeFileSync("test/_data/output/aggregate/multiplesummary_data.json", JSON.stringify(aggregators, null, 2));
output = aggregate.accumulatorOutput(aggregators);
fs.writeFileSync("test/_data/output/aggregate/multiplesummary_output.json", JSON.stringify(output, null, 2));
