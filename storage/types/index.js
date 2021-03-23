// storage/types
"use strict";

exports.Field = require('./field');
exports.Engram = require('./engram');
exports.StorageResults = require('./storage-results');
exports.StorageError = require('./storage-error');

exports.stringBreakpoints = require("./stringBreakpoints");
exports.parseValue = require('./parseValue');
exports.storageType = require('./storageType');

// storage types
//  "null"
//  "boolean"
//  "integer"
//  "number"
//  "keyword"
//  "text" | "string"
//  "date"
//  "uuid"
//  "binary"
