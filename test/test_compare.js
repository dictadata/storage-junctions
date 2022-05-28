
const _compare = require("./lib/_compare");

let retCode = _compare("./data/input/foofile.json", "./data/input/foofile.json.gz");
console.log(retCode);

retCode = _compare("./data/input/foofile_01.json", "./data/input/foofile.json");
console.log(retCode);
