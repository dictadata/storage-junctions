/**
 * test/transform
 */
"use strict";

const transform = require('./_transform');
const logger = require('../../lib/logger');

logger.info("=== Test: transform");

async function testFileTransform() {

  logger.info("<<< transfer json to json");
  logger.verbose('./test/data/testfile.json');

  await transform({
    source: {
      smt: "json|./test/data/|testfile.json|*",
      options: {}
    },
    destination: {
      smt: "json|./test/output/|transform_output.json|*",
      options: {}
    },
    transforms: {
      inject: {
        "newfield": "my new field"
      },
      match: {
        "completed": {
          op: 'eq',
          value: false
        }
      },
      drop: {
        "id": {
          "op": 'eq',
          value: 5678
        }
      },
      mapping: {
        "id": "id",
        "content": "content",
        "completed": "completed",
        "assignee.name": "name"
      }
    }
  });

  logger.verbose('./test/output/transform_output.json');
}

async function testDBTransform() {

  logger.info("transfer with transform mysql to elasticsearch");
  await transform({
    "source": {
      "smt": "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|=Foo",
      "options": {}
    },
    "destination": {
      "smt": "elasticsearch|http://localhost:9200|test_transform|=Foo",
      "options": {}
    },
    "transforms": {
      "inject": {
        "Fie": "where's fum?"
      },
      "match": {
        "Bar": {
          "op": "eq",
          "value": "row"
        }
      },
      "drop": {
        "Baz": {
          "op": "eq",
          "value": 5678
        }
      },
      "mapping": {
        "Foo": "Foo",
        "Bar": "Bar",
        "Baz": "Bazzy"
      }
    }
  });

}

async function tests() {
  await testFileTransform();
  await testDBTransform();
}

tests();
