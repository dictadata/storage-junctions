const path = require('path');

// valid joins
console.log(path.resolve(path.join("/var/data/dictadata.net", "foofile.json")));
console.log(path.resolve(path.join("/var/data/dictadata.net/", "/foofile.json")));
console.log(path.resolve(path.join("/var/data/dictadata.net/", "./foofile.json")));
console.log(path.resolve(path.join("/var/data/dictadata.net/", ".//foofile.json")));

console.log(path.resolve(path.join("/var/data/dictadata.net/", "test/input/foofile.json")));
console.log(path.resolve(path.join("/var/data/dictadata.net/", "/test/input/foofile.json")));
console.log(path.resolve(path.join("/var/data/dictadata.net/", "./test/input/foofile.json")));

// invalid joins
console.log(path.resolve(path.join("C:/var/data/dictadata.net", "C:/test/input/foofile.json")));
console.log(path.resolve(path.join("c:/var/data/dictadata.net", "c:/test/input/foofile.json")));

console.log(path.resolve(path.join("/var/data/dictadata.net/", "../test/input/foofile.json")));
console.log(path.resolve(path.join("/var/data/dictadata.net/", "/test/../../input/foofile.json")));
