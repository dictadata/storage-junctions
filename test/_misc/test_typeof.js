const http = require('node:http')

function typeOf(obj, constructor = false) {

  // "[object BaseType]"
  let baseType = Object.prototype.toString.call(obj).slice(8, -1);

  if (constructor && baseType !== "Null") {
    let name = obj?.constructor.name;
    return  name;
  }
  else {
    return baseType.toLowerCase();
  }

  /*
  if (deepType === 'generatorfunction') {
    return 'function';
  }

  if (deepType.endsWith('array') && deepType !== 'array')
    return 'typedarray';

  // Prevent overspecificity (for example, [object HTMLDivElement], etc).
  // Account for functionish Regexp (Android <=2.3), functionish <object> element (Chrome <=57, Firefox <=52), etc.
  // String.prototype.match is universally supported.

  let ot;
  if (deepType.match(/^(Array|Map|Set|BigInt|Date|Error|Function|Generator|RegExp|Symbol)$/))
    ot = deepType;
  else if (typeof obj === 'object')
    ot = 'object'
  else
    ot = typeof obj;

  return ot;
  */
}

function logTypeOf(obj) {
  console.log("typeof     : " + typeof obj);
  console.log("typeOf     : " + typeOf(obj));
  console.log("constructor: " + typeOf(obj, true));
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

console.log('myClass');
logTypeOf(myClass);

console.log('new myClass()');
logTypeOf(new myClass());

console.log('new OutgoingMessage');
let msg = new http.OutgoingMessage();
logTypeOf(msg);
