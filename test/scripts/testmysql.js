"use strict";

const recall = require('./_recall');
const transfer = require('./_transfer');

console.log("=== Test: mysql");

async function tests() {

  console.log("=== test recall");
  await recall({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_table|*",
    key: 1
  });

  console.log("=== test reader");
  await transfer({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_table|*",
    dst_smt: "csv|./test/output/|mysql_output.csv|*"
  });

  console.log("=== test writer");
  await transfer({
    src_smt: "csv|./test/data/|testfile.csv|*",
    dst_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_writer|=Foo"
  });
}

tests();
