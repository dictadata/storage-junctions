/**
 * test/elasticsearch
 */
"use strict";

const retrieve = require('../_lib/_retrieve');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== elasticsearch retrieve term");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*"
    },
    terminal: {
      output: "./test/_data/output/elasticsearch/retrieve_all.json"
    }
  })) return 1;

  logger.info("=== elasticsearch retrieve term");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*",
      pattern: {
        match: {
          "Foo": "first"
        }
      }
    },
    terminal: {
      output: "./test/_data/output/elasticsearch/retrieve_1.json"
    }
  })) return 1;

  logger.info("=== elasticsearch retrieve term expression");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*",
      pattern: {
        match: {
          "Foo": { "eq": "first" }
        }
      }
    },
    terminal: {
      output: "./test/_data/output/elasticsearch/retrieve_2.json"
    }
  })) return 1;

  logger.info("=== elasticsearch retrieve term array");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*",
      pattern: {
        match: {
          "Foo": [ "first", "second" ]
        }
      }
    },
    terminal: {
      output: "./test/_data/output/elasticsearch/retrieve_3.json"
    }
  })) return 1;

  logger.info("=== elasticsearch retrieve range");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_widgets|*",
      pattern: {
        match: {
          "Foo": "first",
          "Baz": { "gte": 0, "lte": 1000 }
        },
        count: 3,
        order: { "Dt Test": "asc" },
        fields: [ "Foo", "Baz", "tags", "widgets" ]
      }
    },
    terminal: {
      output: "./test/_data/output/elasticsearch/retrieve_4.json"
    }
  })) return 1;

  logger.info("=== elasticsearch retrieve w/ cues");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema_01|*",
      pattern: {
        "order": { "Foo": "asc" },
        "count": 5
      }
    },
    terminal: {
      output: "./test/_data/output/elasticsearch/retrieve_5.json"
    }
  })) return 1;

  logger.info("=== elasticsearch retrieve wildcard");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*",
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        },
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      output: "./test/_data/output/elasticsearch/retrieve_6.json"
    }
  })) return 1;

  logger.info("=== elasticsearch retrieve full-text search");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*",
      pattern: {
        match: {
          "Bar": {
            'search': 'row boat'
          }
        },
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      output: "./test/_data/output/elasticsearch/retrieve_7.json"
    }
  })) return 1;

  logger.info("=== elasticsearch retrieve full-text search AND");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*",
      pattern: {
        match: {
          "Bar": {
            'search': 'row boat',
            'op': 'AND'
          }
        },
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      output: "./test/_data/output/elasticsearch/retrieve_8.json"
    }
  })) return 1;

  logger.info("=== elasticsearch retrieve full-text search phrase");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*",
      pattern: {
        match: {
          "Bar": {
            'search': 'row your boat',
            'op': 'phrase'
          }
        },
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      output: "./test/_data/output/elasticsearch/retrieve_9.json"
    }
  })) return 1;

  logger.info("=== elasticsearch retrieve full-text search multiple fields");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*",
      pattern: {
        match: {
          "~search": {
            'search': 'big data*',
            'fields': [ "Bar" ],
            "op": "AND"
          }
        },
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      output: "./test/_data/output/elasticsearch/retrieve_10.json"
    }
  })) return 1;


  logger.info("=== elasticsearch retrieve pk");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*",
      pattern: {
        match: {
          "Foo": "twenty"
        }
      }
    },
    terminal: {
      output: "./test/_data/output/elasticsearch/retrieve_pk.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
