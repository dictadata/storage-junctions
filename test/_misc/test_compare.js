
const { compare } = require('@dictadata/lib/test');

let retCode = compare("./test/_data/input/foofile.json.gz", "./test/_data/input/foofile.json");
console.log(retCode);

retCode = compare("./test/_data/input/foofile_01.json", "./test/_data/input/foofile.json");
console.log(retCode);
