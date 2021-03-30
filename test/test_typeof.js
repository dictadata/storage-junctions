#!/usr/bin/env node

function type(obj, fullClass = false) {
  // get toPrototypeString() of obj (handles all types)
  // Early JS environments return '[object Object]' for null, so it's best to directly check for it.
  if (fullClass) {
    return (obj === null) ? '[object Null]' : Object.prototype.toString.call(obj);
  }

  if (obj == null) { return (obj + '').toLowerCase(); } // implicit toString() conversion

  var deepType = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
  if (deepType === 'generatorfunction') { return 'function' }

  // Prevent overspecificity (for example, [object HTMLDivElement], etc).
  // Account for functionish Regexp (Android <=2.3), functionish <object> element (Chrome <=57, Firefox <=52), etc.
  // String.prototype.match is universally supported.

  return deepType.match(/^(array|bigint|date|error|function|generator|regexp|symbol)$/) ? deepType :
    (typeof obj === 'object' || typeof obj === 'function') ? 'object' : typeof obj;
}

function print(obj) {
  console.log(typeof obj);
  //console.log(Object.prototype.toString.call(obj));
  //console.log(type(obj,true));
  console.log(type(obj));
  console.log("");
}


let obj1 = {};
print(obj1);

let obj2 = { a: 1 };
print(obj2);

let obj3 = [1];
print(obj3);

let obj4 = new Date();
print(obj4);

let obj5 = (x) => x += 1;
print(obj5);

let obj6 = /abc/;
print(obj6);

let obj7 = "string";
print(obj7);

let objA = true;
print(objA);

let obj8 = 100;
print(obj8);

let obj9;
print(obj9);

let obj10 = null;
print(obj10);


class myClass {
  constructor() {
    this.a = 1;
    this.b = "abc";
  }
}

let obj0 = new myClass();
print(obj0);
