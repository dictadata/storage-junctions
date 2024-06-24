
// expression: "=func(evaluate)"
// evaluate: "field1 op field2"
// op: +-*/
var rx = new RegExp(/=([a-z]+)\((.+)\)/);

console.log(rx.exec("totals"));
console.log(rx.exec("=sum(field1)"));
console.log(rx.exec("=sum(field1*field2)"));

let u;
let val = 12;
console.log(val < u);
console.log(val == u);
console.log(val > u);
console.log(u === undefined);
