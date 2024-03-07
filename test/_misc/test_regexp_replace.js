
const templateRx = /\$\{\s?([^{}\s]*)\s?\}/g;
let rx = RegExp(/\$\{\s?([^{}\s]+)\s?\}/g);

///// replace a multiple vars in string

let value = "State Representative District ${district}-${sub}";

let results = rx.exec(value);
console.log(results);

let params = {
  "district": "001",
  "other": "nonused",
  "sub": "B",
  "fields": [ 12, 14 ]
};

console.log(value.replace(rx, (matched, name) => {
  if (Object.hasOwn(params, name))
    return params[ name ];
  else
    return matched; // original value
}));
console.log("");

///// replace entire value '=${x}'

let value2 = "=${fields}";
results = rx.exec(value2);  // only finds first match ???
console.log(results);

console.log(results ? params[ results[ 1 ] ] : value2);
console.log("");

///// should return original string if vars not found in params

let value3 = "this string ${nomatch} vars in it";
results = rx.exec(value3);
console.log(results);

console.log(results && results[1] in params ? params[ results[ 1 ] ] : value3);
