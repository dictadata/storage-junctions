/**
 * test/transform
 */
"use strict";

const transform = require('./lib/_transform');
const Engram = require('../lib/engram');
const logger = require('../lib/logger');

logger.info("=== Test: transforms");

async function testEtlTransform() {
  logger.info("=== transfer/transform json to elasticsearch");
  logger.verbose('<<< ./test/data/foofile.json');
  logger.verbose('>>> elastichsearch etl-2');

  await transform({
    "source": {
      "smt": "json|./test/data/|foofile.json|*",
      "options": {}
    },
    "destination": {
      "smt": "elasticsearch|http://localhost:9200|etl-2|=Foo",
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
        "Foo": "foo",
        "Bar": "bar",
        "Baz": "baz",
        "Fobe": "fobe",
        "Dt Test": "dt_test",
        "enabled": "enabled",
        "subObj1.state": "state",
        "subObj2.subsub.izze": "izze"
      }
    }
  });

}

async function testFile2Transform() {

  logger.info("=== transfer json to csv");
  logger.verbose('<<< ./test/data/testfile2.json');
  logger.verbose('>>> ./test/output/transform_output2.csv');

  await transform({
    source: {
      smt: "json|./test/data/|testfile2.json|*"
    },
    destination: {
      smt: "csv|./test/output/|transform_output2.csv|*"
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

}

async function testDBTransform() {

  logger.info("=== transfer with transform mysql to elasticsearch");
  logger.verbose("<<< mysql foo_schema");
  logger.verbose(">>> elastichsearch foo_transform");

  await transform({
    "source": {
      "smt": "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|=Foo",
      "options": {}
    },
    "destination": {
      "smt": "elasticsearch|http://localhost:9200|foo_transform|=Foo",
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

async function forecastTransform(options) {

  let engram = new Engram(options.destination.smt);
  logger.info("=== transfer REST to " + engram.smt.model);
  logger.verbose("<<< weather API");
  logger.verbose(">>> " + engram.smt.model + " " + engram.smt.schema);

  await transform({
    source: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|=*",
      options: {
        headers: {
          "Accept": "application/ld+json",
          "User-Agent": "@dictadata.org/storage-node contact:drew@dictadata.org"
        },
        reader: {
          extract: {
            encoding: "",  // name of property containing an array of field headers
            // empty denotes data array contains json objects
            data: "periods"  // name of property for data array (objects or values)
          }
        }
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
  await testEtlTransform();
  await testFile2Transform();
  await testDBTransform();
  await forecastTransform({ destination: { smt: "elasticsearch|http://localhost:9200|rest_forecast|=Foo"}});
  await forecastTransform({ destination: { smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|rest_forecast|*" } });
}

tests();
