/**
 * test/mysql
 */
"use strict";

const store = require('./_store');
const recall = require('./_recall');
const retrieve = require('./_retrieve');
const transfer = require('./_transfer');

console.log("=== Test: mysql");

async function tests() {

  console.log("=== mysql store");
  await store({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_table|=Foo",
    construct: {}
  });

  console.log("=== mysql recall");
  await recall({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_table|=Foo",
    key: 1
  });

  console.log("=== mysql retrieve");
  await retrieve({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_table|*",
    pattern: { filter: {} }
  });


  console.log("=== mysql reader");
  await transfer({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_table|*",
    dst_smt: "csv|./test/output/|mysql_output.csv|*"
  });

  console.log("=== mysql writer");
  await transfer({
    src_smt: "csv|./test/data/|testfile.csv|*",
    dst_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_writer|*"
  });
}

tests();
