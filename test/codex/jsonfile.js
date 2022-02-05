/**
 * test/codex/jsonfile
 */
"use strict";

const storage = require("../../storage");
const { Engram } = require("../../storage/types");
const { logger } = require("../../storage/utils");

logger.info("=== Tests: codex store");

// Test Outline:
// use codex in Elasticsearch index
// query foo_schema from JSON file using codex name for SMT
