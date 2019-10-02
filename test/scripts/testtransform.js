/**
 * test/transform
 */
"use strict";

const transform = require('./_transform');
const logger = require('../../lib/logger');

logger.info("=== Test: transform");

async function tests() {
  logger.verbose('./test/data/testfile.json');

  await transform({
    src_smt: "json|./test/data/|testfile.json|*",
    dst_smt: "json|./test/output/|transform_output.json|*",
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

tests();
