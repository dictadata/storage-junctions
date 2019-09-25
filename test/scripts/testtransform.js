/**
 * test/transform
 */
"use strict";

const transform = require('./_transform');

console.log("=== Test: transform");

async function tests() {

  await transform({
    src_smt: "json|./test/data/|testfile.json|*",
    dst_smt: "json|./test/output/|transform_output.json|*",
    transforms: {
      template: {},
      transforms: {
        "id": "id",
        "content": "content",
        "completed": "completed",
        "assignee.name": "name"
      }
    }
  });

}

tests();
