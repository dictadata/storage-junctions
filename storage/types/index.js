// storage/types
"use strict";

exports.SMT = require('./smt');
exports.Engram = require('./engram');
exports.Entry = require('./entry');
exports.Field = require('./field');

exports.StorageResponse = require('./storage-response');
exports.StorageError = require('./storage-error');

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
//  "unknown"  - used for fields that have all null values
