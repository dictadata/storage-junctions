/**
 * test/json_list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../lib/logger');

logger.info("=== tests: json list");

async function tests() {
  logger.info("=== list local filesystem");
  await list({
    source: {
      smt: "json|./test/|*.json|*",
      options: {
        list: {
          recursive: true,
          forEach: (name) => {
            logger.info("- " + name);
          }
        }
      }
    }
  });

  logger.info("=== list S3 bucket");
  await list({
    source: {
      smt: "json|S3:dictadata.org/test/output/|*.json|*",
      options: {
        list: {
          recursive: false,
          forEach: (name) => {
            logger.info("- " + name);
          }
        }
      }
    }
  });

  logger.info("=== list S3 bucket (recursive)");
  await list({
    source: {
      smt: "json|S3:dictadata.org/test/|*.json.*|*",
      options: {
        list: {
          recursive: true
        }
      }
    }
  });

}

tests();
