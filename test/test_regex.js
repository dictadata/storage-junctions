
function test(value) {
  //rx = new RegExp(/(\d)(?=(\d{3})+(?!\d))/);
  //rx = new RegExp(/^\$?\d+(,\d{3})*(\.\d*)?$/);
  var rx = new RegExp(/^(\$?\d{1,3}(?:,?\d{3})*(?:\.\d{2})?|\.\d{2})?$/);
  if (rx.test(value))
    console.log(value + " OK " + Number(value.replace(/[\$,]/g, '')));
  else
    console.log(value + " FAILED");
}

console.log("numbers with delimiters");
//rx = new RegExp(/(\d)(?=(\d{3})+(?!\d))/);
//rx = new RegExp(/^\$?\d+(,\d{3})*(\.\d*)?$/);
var rx = new RegExp(/^(\$?\d{1,3}(?:,?\d{3})*(?:\.\d{2})?|\.\d{2})?$/);
test("10000");
test("10,000");
test("100.12");
test("100.123");
test("$1,000,000.40");
test("$12.99");
test(".35");
test("1,0000.034");
test("0.4");
