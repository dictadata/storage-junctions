// storage/types
"use strict";

exports.Field = require('./field');
exports.Engram = require('./engram');
exports.StorageResponse = require('./storage-response');
exports.StorageError = require('./storage-error');

exports.SMT = require('./smt');
exports.parseValue = require('./parseValue');
exports.storageType = require('./storageType');
exports.stringBreakpoints = require("./stringBreakpoints");

// dicta storage types
//  "boolean"
//  "integer"
//  "number"
//  "keyword"
//  "text" | "string"
//  "date"
//  "uuid"
//  "binary"
//  "variable"

// well known JSON object types
//  "geometry" - GeoJSON geometry object

// other types
//  "unknown"  - used for values that are null
