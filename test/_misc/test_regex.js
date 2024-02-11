console.log("----- test paths");

function testPath() {
  var rx = new RegExp(/^Ames\/.*\.shp$/);
  console.log(rx.test("Ames/Ames Precincts.shp"));

  rx = new RegExp(/^Ames\/.*\.shp$/);
  console.log(rx.test("Ames/Ames Precincts.shp"));
}


testPath();

console.log("----- test numbers with delimiters");
console.log("integer, number, currency, value");

function testInteger(value) {
  var rx = new RegExp(/^\s*[-+]?(\d{1,3}(?:,?\d{3})*)?\s*$/);
  return (rx.test(value));
  //  console.log(value + " OK " + Number(value.replace(/[\,]/g, '')));
}

function testNumber(value) {
  var rx = new RegExp( /^\s*[-+]?(\d{1,3}(?:,?\d{3})*(?:\.\d*)?|\.\d*)?\s*$/ );
  return (rx.test(value));
  // console.log(value + " OK " + Number(value.replace(/[\,]/g, '')));
}

function testCurrency(value) {
  //rx = new RegExp(/(\d)(?=(\d{3})+(?!\d))/);
  //rx = new RegExp(/^\$?\d+(,\d{3})*(\.\d*)?$/);
  var rx = new RegExp(/^\s*\(?(\$?\d{1,3}(?:,?\d{3})*(?:\.\d{2})?|\.\d{2})?\)?\s*$/);
  return (rx.test(value));
  // console.log(value + " OK " + Number(value.replace(/[\$\(,\)]/g, '')));

}

function testValue(value) {
  let results = "";

  results += testInteger(value)  ? "TRUE  " : "FALSE ";
  results += testNumber(value)   ? "TRUE  " : "FALSE ";
  results += testCurrency(value) ? "TRUE  " : "FALSE ";
  results += value;

  console.log(results);
}

testValue("1");
testValue("+1");
testValue("-1");
testValue("100");
testValue("100.12");
testValue("100.123");
testValue("10000");
testValue("10,000");
testValue("1,000,000");
testValue("$1,000,000");
testValue("($1,000,000)");
testValue("$12.99");
testValue(".35");
testValue("0.4");
testValue("1.");
testValue("1,00");
testValue("1,0000");
testValue(" +1");
testValue("-1 ");
testValue(" 1 ");
testValue(" +10.123");
testValue("-10.123");
testValue(" 10.123 ");
testValue(" $10.12");
testValue("($10.12) ");
testValue(" $10.12 ");
