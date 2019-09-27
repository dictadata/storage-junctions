/**
 * test/mysql
 */
"use strict";

const putEncoding = require('./_putEncoding');
const store = require('./_store');
const recall = require('./_recall');
const retrieve = require('./_retrieve');
const transfer = require('./_transfer');
const dull = require('./_dull');

console.log("=== Test: mysql");

async function tests() {

  console.log("=== elasticsearch putEncoding");
  await putEncoding({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_table|*"
  });

  console.log("=== mysql store");
  await store({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_table|=Foo",
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
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

  console.log("=== mysql dull");
  await dull({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_table|*",
    options: {
      Foo: 'twenty'
    }
  });

  console.log("=== mysql writer");
  await transfer({
    src_smt: "csv|./test/data/|testfile.csv|*",
    dst_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_writer|*"
  });

  console.log("=== mysql reader");
  await transfer({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_writer|*",
    dst_smt: "csv|./test/output/|mysql_output.csv|*"
  });
}

tests();
