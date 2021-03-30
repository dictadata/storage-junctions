#!/usr/bin/env node

const _compare = require("./lib/_compare");

let retCode = _compare("./data/foofile.json", "./data/foofile.json.gz");
console.log(retCode);

retCode = _compare("./data/foofile_01.json", "./data/foofile.json");
console.log(retCode);
