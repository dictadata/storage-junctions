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
  let uid = await store({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_table|=Foo",
    construct: {
      Foo: 'twenty',
      Bar: 123,
      Biz: 99.9
    }
  });

  console.log("=== mysql recall");
  await recall({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_table|=Foo",
    options: {
      Foo: 'twenty'
    }
  });

  console.log("=== mysql recall");
  await recall({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_table|*",
    options: {
      Foo: 'twenty'
    }
  });

  console.log("=== mysql retrieve");
  await retrieve({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_table|*",
    pattern: {
      filter: {
        "Foo": 'twenty'
      }
    }
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
