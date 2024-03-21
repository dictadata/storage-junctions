const path = require('node:path');

// valid joins
console.log(path.resolve(path.join("/var/dictadata/test", "foofile.json")));
console.log(path.resolve(path.join("/var/dictadata/test/", "/foofile.json")));
console.log(path.resolve(path.join("/var/dictadata/test/", "./foofile.json")));
console.log(path.resolve(path.join("/var/dictadata/test/", ".//foofile.json")));

console.log(path.resolve(path.join("/var/dictadata/test/", "input/foofile.json")));
console.log(path.resolve(path.join("/var/dictadata/test/", "/input/foofile.json")));
console.log(path.resolve(path.join("/var/dictadata/test/", "./input/foofile.json")));

// invalid joins
console.log(path.resolve(path.join("C:/var/dictadata/test", "C:/input/foofile.json")));
console.log(path.resolve(path.join("c:/var/dictadata/test", "c:/input/foofile.json")));

console.log(path.resolve(path.join("/var/dictadata/test/", "../input/foofile.json")));
console.log(path.resolve(path.join("/var/dictadata/test/", "/../../input/foofile.json")));
