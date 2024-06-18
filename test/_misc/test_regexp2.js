
function replace(fld) {
  let rx = new RegExp(/.*(boat)/);
  let rep = "$1";
  console.log(fld.replace(rx, rep));

  //let res = rx.exec(fld);
  //console.log(res);
}

replace("row");
replace("row boat");
replace("your boat");
replace("row your boat");
replace("row boat buddy");

console.log();
console.log(/[^A-Za-z0-9_]/.test("row boat_buddy123"));
console.log(/[^A-Za-z0-9_]/.test("rowboat_buddy123"));
console.log(/[^A-Za-z0-9_]/.test("row\tboat_buddy123"));
console.log();
console.log(/[^A-Za-z0-9_ ]/.test("row_boat_buddy123"));
console.log(/[^A-Za-z0-9_ ]/.test("row boat buddy123"));
console.log(/[^A-Za-z0-9_ ]/.test("row\tboat_buddy123"));
