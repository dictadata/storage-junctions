function typeOf(obj, fullClass = false) {
  // use obj.prototype.toString() for deepType (handles all types)

  if (fullClass) {
    // return type as "[object deepType]" format
    // Note, early JS environments return '[object Object]' for null.
    return (obj === null) ? '[object Null]' : Object.prototype.toString.call(obj);
  }

  // really old bug in Javascript that where typeof null returns 'object'
  if (obj == null) {                  // null or undefined
    return (obj + '').toLowerCase(); // implicit toString() conversion
  }

  var deepType = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
  console.log('deepType ' + deepType);

  if (deepType === 'generatorfunction') {
    return 'function';
  }

  if (deepType.endsWith('array') && deepType !== 'array')
    return 'typedarray';

  // Prevent overspecificity (for example, [object HTMLDivElement], etc).
  // Account for functionish Regexp (Android <=2.3), functionish <object> element (Chrome <=57, Firefox <=52), etc.
  // String.prototype.match is universally supported.

  return deepType.match(/^(array|map|set|bigint|date|error|function|generator|regexp|symbol)$/) ? deepType :
    (typeof obj === 'object' || typeof obj === 'function') ? 'object' : typeof obj;
}

function logTypeOf(obj) {
  console.log("typeof   " + typeof obj);
  //console.log(Object.prototype.toString.call(obj));
  //console.log(type(obj,true));
  console.log("typeOf   " + typeOf(obj));
  console.log("");
}

console.log('undefined');
logTypeOf();

console.log('null');
logTypeOf(null);

console.log('true');
logTypeOf(true);

console.log('0');
logTypeOf(0);

console.log('100');
logTypeOf(100);

console.log('100000000000n');
logTypeOf(100000000000n);

console.log('""');
logTypeOf("");

console.log('"string"');
logTypeOf("string");

console.log('{}');
logTypeOf({});

console.log('{ a: 1 }');
logTypeOf({ a: 1 });

console.log('[1]');
logTypeOf([ 1 ]);

console.log('new Date()');
logTypeOf(new Date());

console.log('(x) => x += 1');
logTypeOf((x) => x += 1);

console.log('/abc/');
logTypeOf(/abc/);

console.log('new Array()');
logTypeOf(new Array());

console.log('new Map()');
logTypeOf(new Map());

console.log('new Set()');
logTypeOf(new Set());

console.log('new Int8Array(8)');
logTypeOf(new Int8Array(8));

class myClass {
  constructor() {
    this.a = 1;
    this.b = "abc";
  }
}

console.log('new myClass()');
logTypeOf(new myClass());
