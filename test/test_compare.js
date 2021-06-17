#!/usr/bin/env node

const _compare = require("./lib/_compare");

let retCode = _compare("./test/data/foofile.json", "./test/data/foofile.json.gz");
console.log(retCode);

retCode = _compare("./test/data/foofile_01.json", "./test/data/foofile.json");
console.log(retCode);
