
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
