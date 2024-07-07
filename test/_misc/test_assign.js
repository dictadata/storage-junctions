
let obj1 = {
  base: 1,
  sub: {
    level: 2
  }
}

let obj2 = Object.assign({}, obj1);

obj2.sub.level = "danger";

console.log(obj1);
