let value = "State Representative District 001";
let rx = RegExp("(\\d{1,})");
let rep = "$1";

let results = rx.exec(value);
console.log(results);

let val = rep;
for (let i = 0; i < results.length; i++)
  val = val.replace('$' + i, results[ i ]);
console.log(val);
