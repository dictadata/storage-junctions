var prefix
var options = {
  name: "optName",
  schema: "optSchema"
}
var smt = {
  schema: "smtSchema"
}

let filename = (prefix || '') + ( options?.schema || smt.schema);

console.log(filename)
console.log(prefix ?? '' + options.name)
