const dot = require('../../storage/utils/dot');

let obj = {
  t1: "top",
  foo: {
    bar: {
      baz: "hello"
    }
  }
};

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


let obj2 = {
  name: "encoding",
  description: "data source engram",
  type: "engram",
  smt: {
    "model": "elasticsearch",
    "locus": "http://localhost:9200",
    "schema": "index name",
    "key": "!field1"
  },
  fields: [
    {
      "name": "field1",
      "type": "string",
      "key": 1
    },
    {
      "name": "field2",
      "type": "list",
      "fields": [
        {
          "name": "fld1",
          "type": "string"
        },
        {
          "name": "fld2",
          "type": "number"
        }
      ]
    },
    {
      "name": "field3",
      "type": "number"
    }
  ]
};

console.log("");
console.log("locus = " + dot.get("smt.locus", obj2));
console.log("fields = " + dot.get("fields", obj2));
console.log("fields2 = " + dot.get("fields.name=field2.fields", obj2));
console.log("fld2 = " + dot.get("fields.name=field2.fields.name=fld2.type", obj2));

console.log("set description = ", dot.set("description", obj2, "this is a new description"));
console.log("set source = " + dot.set("source", obj2, "a source reference"));
console.log("set field2 description = " + dot.set("fields.name=field2.description", obj2, "field description"));
console.log("set field4 = " + dot.set("fields.field4", obj2, { "name": "field4", "type": "boolean" }));
console.log("set fld3 = " + dot.set("fields.name=field2.fields.name=fld3", obj2, { "name": "fld3", "type": "boolean" }));

console.log(JSON.stringify(obj2,null,2));
