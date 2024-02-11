
const _compare = require("../lib/_compare");

let retCode = _compare("./test/data/input/foofile.json", "./test/data/input/foofile.json.gz");
console.log(retCode);

retCode = _compare("./test/data/input/foofile_01.json", "./test/data/input/foofile.json");
console.log(retCode);
