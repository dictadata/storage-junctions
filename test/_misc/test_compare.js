
const { compare } = require('@dictadata/lib/test');

let retCode = compare("./test/data/input/foofile.json.gz", "./test/data/input/foofile.json");
console.log(retCode);

retCode = compare("./test/data/input/foofile_01.json", "./test/data/input/foofile.json");
console.log(retCode);
