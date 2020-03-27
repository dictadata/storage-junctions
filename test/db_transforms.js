/**
 * test/transform
 */
"use strict";

const transfer = require('./lib/_transfer');
const Engram = require('../lib/engram');
const logger = require('../lib/logger');

logger.info("=== Test: transform");

async function testEtlTransform() {
  logger.info("=== transfer/transform json to elasticsearch");
  logger.verbose('<<< ./test/data/foofile.json');
  logger.verbose('>>> elasticsearch foo_transform_1');

  await transfer({
    "source": {
      "smt": "json|./test/data/|foofile.json|*",
      "options": {}
    },
    "destination": {
      "smt": "elasticsearch|http://localhost:9200|foo_transform_1|=Foo",
      "options": {}
    },
    "transforms": {
      "filter": {
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
        }
      },
      "fields": {
        "inject_before": {
          "Fie": "where's fum?"
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
    }
  });

}

async function testDBTransform() {

  logger.info("=== transfer/transform mysql to elasticsearch");
  logger.verbose("<<< mysql foo_schema");
  logger.verbose(">>> elasticsearch foo_transform_2");

  await transfer({
    "source": {
      "smt": "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|=Foo",
      "options": {}
    },
    "destination": {
      "smt": "elasticsearch|http://localhost:9200|foo_transform_2|=Foo",
      "options": {}
    },
    "transforms": {
      "filter": {
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
        }
      },
      "fields": {
        "inject_before": {
          "Fie": "where's fum?"
        },
        "mapping": {
          "Foo": "Foo",
          "Bar": "Bar",
          "Baz": "Bazzy"
        }
      }
    }
  });

}

async function forecastTransform(options) {

  let engram = new Engram(options.destination.smt);
  logger.info("=== transfer REST to " + engram.smt.model);
  logger.verbose("<<< weather API");
  logger.verbose(">>> " + engram.smt.model + " " + engram.smt.schema);

  await transfer({
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
      "fields": {
        "inject_after": {
          "Fie": "It's always sunny in Philadelphia?"
        }
      }
    }
  });

}

async function tests() {
  await testEtlTransform();
  await testDBTransform();
  await forecastTransform({ destination: { smt: "elasticsearch|http://localhost:9200|rest_forecast|=Foo" } });
  await forecastTransform({ destination: { smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|rest_forecast|*" } });
}

tests();
