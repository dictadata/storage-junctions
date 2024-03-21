const fs = require('node:fs');

let text = fs.readFileSync('test_json_multiline.json');
let j = JSON.parse(text);

console.log(j);
