/**
 * @dictadata/storage-junctions
 */
"use strict";

// this module is a "superset" of Cortex
var Cortex = require("./cortex");
module.exports = exports = Cortex;

///// Codex class
exports.Codex = require("./codex/codex");

///// Storage types
//const types = require("./types");
//exports.Engram = types.Engram;
//exports.Field = types.Field;
//exports.StorageResponse = types.StorageResponse;
//exports.StorageError = types.StorageError;

///// Storage utils
//const utils = require("./utils");

//////////
///// register Storage FileSystems
exports.StorageFileSystem = require("./filesystems/storage-filesystem");

exports.FSFileSystem = require("./filesystems/fs-filesystem");
Cortex.FileSystems.use('file', exports.FSFileSystem);

exports.FTPFileSystem = require("./filesystems/ftp-filesystem");
Cortex.FileSystems.use('ftp', exports.FTPFileSystem);

exports.HTTPFileSystem = require("./filesystems/http-filesystem");
Cortex.FileSystems.use('http', exports.HTTPFileSystem);
Cortex.FileSystems.use('https', exports.HTTPFileSystem);

exports.ZipFileSystem = require("./filesystems/zip-filesystem");
Cortex.FileSystems.use('zip', exports.ZipFileSystem);

//////////
///// register Storage Junctions
var StorageJunction = require("./junctions/storage-junction");
exports.StorageJunction = StorageJunction;
exports.StorageReader = StorageJunction.StorageReader;
exports.StorageWriter = StorageJunction.StorageWriter;
Cortex.use('*', StorageJunction);

var MemoryJunction = require("./junctions/memory");
exports.MemoryJunction = MemoryJunction;
Cortex.use('memory', MemoryJunction);

var CSVJunction = require("./junctions/csv");
exports.CSVJunction = CSVJunction;
Cortex.use('csv', CSVJunction);

var JSONJunction = require("./junctions/json");
exports.JSONJunction = JSONJunction;
Cortex.use('json', JSONJunction);   // defaults to json array
Cortex.use('jsons', JSONJunction);  // json stream
Cortex.use('jsonl', JSONJunction);  // json line
Cortex.use('jsona', JSONJunction);  // json array
Cortex.use('jsono', JSONJunction);  // json object

var ParquetJunction = require("./junctions/parquet");
exports.ParquetJunction = ParquetJunction;
Cortex.use('parquet', ParquetJunction);

var ElasticsearchJunction = require("./junctions/elasticsearch");
exports.ElasticsearchJunction = ElasticsearchJunction;
Cortex.use('elastic', ElasticsearchJunction);
Cortex.use('elasticsearch', ElasticsearchJunction);

var MSSQLJunction = require("./junctions/mssql");
exports.MSSQLJunction = MSSQLJunction;
Cortex.use('mssql', MSSQLJunction);

var MySQLJunction = require("./junctions/mysql");
exports.MySQLJunction = MySQLJunction;
Cortex.use('mysql', MySQLJunction);

var RESTJunction = require("./junctions/rest");
exports.RESTJunction = RESTJunction;
Cortex.use('rest', RESTJunction);

var ShapeFileJunction = require("./junctions/shapefile");
exports.ShapeFileJunction = ShapeFileJunction;
Cortex.use('shp', ShapeFileJunction);

var SplitterJunction = require("./junctions/splitter");
exports.SplitterJunction = SplitterJunction;
Cortex.use('splitter', SplitterJunction);
Cortex.use('split', SplitterJunction);

//////////
///// register Storage Transforms
exports.FilterTransform = require("./transforms/filter");
Cortex.Transforms.use('filter', exports.FilterTransform);

exports.SelectTransform = require("./transforms/select");
Cortex.Transforms.use('select', exports.SelectTransform);

exports.ComposeTransform = require("./transforms/compose");
Cortex.Transforms.use('compose', exports.ComposeTransform);

exports.DecomposeTransform = require("./transforms/decompose");
Cortex.Transforms.use('decompose', exports.DecomposeTransform);
Cortex.Transforms.use('flatten', exports.DecomposeTransform);

exports.ConjoinTransform = require("./transforms/conjoin");
Cortex.Transforms.use('conjoin', exports.ConjoinTransform);

exports.AggregateTransform = require("./transforms/aggregate");
Cortex.Transforms.use('aggregate', exports.AggregateTransform);

exports.CodifyTransform = require("./transforms/codify");
Cortex.Transforms.use('codify', exports.CodifyTransform);

exports.EncoderTransform = require("./transforms/encoder");
Cortex.Transforms.use('encoder', exports.EncoderTransform);

exports.MetaStatsTransform = require("./transforms/metastats");
Cortex.Transforms.use('metastats', exports.MetaStatsTransform);
