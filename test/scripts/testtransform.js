/**
 * test/transform
 */
"use strict";

const transform = require('./_transform');
const Engram = require('../../lib/engram');
const logger = require('../../lib/logger');

logger.info("=== Test: transform");

async function testFileTransform() {

  logger.info("<<< transfer json to csv");
  logger.verbose('./test/data/testfile.json');

  await transform({
    source: {
      smt: "json|./test/data/|testfile.json|*",
      options: {}
    },
    destination: {
      smt: "csv|./test/output/|transform_output.csv|*",
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

async function weatherTransform(options) {

  let engram = new Engram(options.destination.smt);
  logger.info("transfer REST to " + engram.smt.model);

  await transform({
    source: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|=*",
      options: {
        headers: {
          "Accept": "application/ld+json",
          "User-Agent": "@dicta.io/storage-node contact:drew@dicta.io"
        },
        dataEncoding: "",  // data array contains objects i.e. with property names
        dataConstructs: "periods"  // data array property name
      }
    },
    "destination": {
      "smt": options.destination.smt,
      "options": {}
    },
    "transforms": {
      "inject": {
        "Fie": "It's always sunny in Philadelphia?"
      }
    }
  });

}

async function tests() {
  await testFileTransform();
  await testDBTransform();
  await weatherTransform({ destination: { smt: "elasticsearch|http://localhost:9200|test_weather|=Foo"}});
  await weatherTransform({ destination: { smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_weather|*" } });
}

tests();
