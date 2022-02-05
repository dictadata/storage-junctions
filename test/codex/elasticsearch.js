/**
 * test/codex/elasticsearch
 */
"use strict";

const storage = require("../../storage");
const { Engram } = require("../../storage/types");
const { logger } = require("../../storage/utils");

logger.info("=== Tests: codex store");

// Test Outline:
// use codex in Elasticsearch index
// query Elasticsearch foo_schema index using codex name for SMT
