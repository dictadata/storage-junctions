/**
 * @dictadata/storage-junctions/test
 * test library
 */
"use strict";

exports.codify = require("./lib/_codify");
exports.compare = require("./lib/_compare");
exports.createSchema = require("./lib/_createSchema.js");
exports.dull = require("./lib/_dull.js");
exports.dullSchema = require("./lib/_dullSchema.js");
exports.getEncoding = require("./lib/_getEncoding.js");
exports.getFiles = require("./lib/_getFiles.js");
exports.list = require("./lib/_list");
exports.putFiles = require("./lib/_putFiles.js");
exports.recall = require("./lib/_recall.js");
exports.retrieve = require("./lib/_retrieve.js");
exports.store = require("./lib/_store.js");
exports.storeBulk = exports.store_bulk = require("./lib/_store_bulk.js");
exports.tee = require("./lib/_tee.js");
exports.transfer = require("./lib/_transfer.js");
