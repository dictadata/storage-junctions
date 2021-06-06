// storage/types
"use strict";

exports.Field = require('./field');
exports.Engram = require('./engram');
exports.StorageResponse = require('./storage-response');
exports.StorageError = require('./storage-error');

exports.stringBreakpoints = require("./stringBreakpoints");
exports.parseValue = require('./parseValue');
exports.storageType = require('./storageType');

// storage types
//  "unknown"
//  "boolean"
//  "integer"
//  "number"
//  "keyword"
//  "text" | "string"
//  "date"
//  "uuid"
//  "binary"
//  "variable"

//  "Geometry" - GeoJSON geometry object
