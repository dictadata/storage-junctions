/**
 * test/codex/mysql
 */
"use strict";

const storage = require("../../storage");
const { Engram } = require("../../storage/types");
const { logger } = require("../../storage/utils");

logger.info("=== Tests: codex store");

// Test Outline:
// use codex in Elasticsearch index
// query MySQL foo_schema table using codex name for SMT
