// storage/types
"use strict";

exports.Field = require('./field');
exports.Engram = require('./engram');
exports.StorageResponse = require('./storage-response');
exports.StorageError = require('./storage-error');

exports.stringBreakpoints = require("./stringBreakpoints");
exports.parseValue = require('./parseValue');
exports.storageType = require('./storageType');

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
//  "Geometry" - GeoJSON geometry object

// other types 
//  "unknown"  - used for values that are null
