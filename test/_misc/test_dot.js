const dot = require('../../storage/utils/dot');

let obj = {
  t1: "top",
  foo: {
    bar: {
      baz: "hello"
    }
  }
}

console.log("t1 = " + dot.get("t1", obj));
console.log("baz = " + dot.get("foo.bar.baz", obj));

console.log("biz = " + dot.get("foo.bar.biz", obj));
console.log("set: " + dot.set("foo.bar.biz", obj, "world"));
console.log("biz = " + dot.get("foo.bar.biz", obj));

console.log("set: " + dot.set("t2", obj, "bottom"));
console.log("t2 = " + dot.get("t2", obj));

console.log("set: " + dot.set("foo.level.expand", obj, true));
console.log("expand = " + dot.get("foo.level.expand", obj));
console.log("set: " + dot.set("foo.level", obj, "II"));
console.log("expand = " + dot.get("foo.level.expand", obj));

let slop = "stringy";
console.log("stray = " + dot.get("foo.stray", slop));
console.log("set = " + dot.set("foo.stray", slop, "drip"));

console.log(JSON.stringify(obj,null,2));
