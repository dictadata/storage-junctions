/**
 * @dictadata/storage-junctions
 *
 * Exposes Class types for:
 *   StorageJunction, FileSystems, Transforms, Codex
 *
 * Registers standard implementations of several:
 *   StorageJunctions, FileSystems, Transforms
 */
"use strict";

var Storage = require("./storage");
exports.Storage = Storage;

//////////
///// register Storage FileSystems
exports.StorageFileSystem = require("./filesystems/storage-filesystem");

exports.FSFileSystem = require("./filesystems/fs-filesystem");
Storage.FileSystems.use('file', exports.FSFileSystem);

exports.FTPFileSystem = require("./filesystems/ftp-filesystem");
Storage.FileSystems.use('ftp', exports.FTPFileSystem);

exports.HTTPFileSystem = require("./filesystems/http-filesystem");
Storage.FileSystems.use('http', exports.HTTPFileSystem);
Storage.FileSystems.use('https', exports.HTTPFileSystem);

exports.StreamFileSystem = require("./filesystems/stream-filesystem");
Storage.FileSystems.use('stream', exports.StreamFileSystem);

exports.ZipFileSystem = require("./filesystems/zip-filesystem");
Storage.FileSystems.use('zip', exports.ZipFileSystem);

//////////
///// register Storage Junctions
var StorageJunction = require("./junctions/storage-junction");
exports.StorageJunction = StorageJunction;
exports.StorageReader = StorageJunction.StorageReader;
exports.StorageWriter = StorageJunction.StorageWriter;
exports.StorageEncoder = StorageJunction.StorageEncoder;
Storage.Junctions.use('*', StorageJunction);

var MemoryJunction = require("./junctions/memory");
exports.MemoryJunction = MemoryJunction;
Storage.Junctions.use('memory', MemoryJunction);

var CSVJunction = require("./junctions/csv");
exports.CSVJunction = CSVJunction;
Storage.Junctions.use('csv', CSVJunction);

var JSONJunction = require("./junctions/json");
exports.JSONJunction = JSONJunction;
Storage.Junctions.use('json', JSONJunction);   // defaults to json array
Storage.Junctions.use('jsons', JSONJunction);  // json stream
Storage.Junctions.use('jsonl', JSONJunction);  // json line
Storage.Junctions.use('jsona', JSONJunction);  // json array
Storage.Junctions.use('jsono', JSONJunction);  // json object

var ParquetJunction = require("./junctions/parquet");
exports.ParquetJunction = ParquetJunction;
Storage.Junctions.use('parquet', ParquetJunction);

var ElasticsearchJunction = require("./junctions/elasticsearch");
exports.ElasticsearchJunction = ElasticsearchJunction;
Storage.Junctions.use('elastic', ElasticsearchJunction);
Storage.Junctions.use('elasticsearch', ElasticsearchJunction);

var MSSQLJunction = require("./junctions/mssql");
exports.MSSQLJunction = MSSQLJunction;
Storage.Junctions.use('mssql', MSSQLJunction);

var MySQLJunction = require("./junctions/mysql");
exports.MySQLJunction = MySQLJunction;
Storage.Junctions.use('mysql', MySQLJunction);

var RESTJunction = require("./junctions/rest");
exports.RESTJunction = RESTJunction;
Storage.Junctions.use('rest', RESTJunction);

var ShapeFileJunction = require("./junctions/shapefile");
exports.ShapeFileJunction = ShapeFileJunction;
Storage.Junctions.use('shp', ShapeFileJunction);

//////////
///// register Storage Transforms
exports.FilterTransform = require("./transforms/filter");
Storage.Transforms.use('filter', exports.FilterTransform);

exports.MutateTransform = require("./transforms/mutate");
Storage.Transforms.use('mutate', exports.MutateTransform);

exports.ComposeTransform = require("./transforms/compose");
Storage.Transforms.use('compose', exports.ComposeTransform);

exports.DecomposeTransform = require("./transforms/decompose");
Storage.Transforms.use('decompose', exports.DecomposeTransform);
Storage.Transforms.use('flatten', exports.DecomposeTransform);

exports.AdjoinTransform = require("./transforms/adjoin");
Storage.Transforms.use('adjoin', exports.AdjoinTransform);

exports.ConjoinTransform = require("./transforms/conjoin");
Storage.Transforms.use('conjoin', exports.ConjoinTransform);

exports.AggregateTransform = require("./transforms/aggregate");
Storage.Transforms.use('aggregate', exports.AggregateTransform);

exports.CodifyTransform = require("./transforms/codify");
Storage.Transforms.use('codify', exports.CodifyTransform);

exports.EncoderTransform = require("./transforms/encoder");
Storage.Transforms.use('encoder', exports.EncoderTransform);

exports.FlowStatsTransform = require("./transforms/flowstats");
Storage.Transforms.use('flowstats', exports.FlowStatsTransform);

exports.RowConstructsTransform = require("./transforms/rowConstructs");
Storage.Transforms.use('row_constructs', exports.RowConstructsTransform);

exports.MapConstructsTransform = require("./transforms/mapConstructs");
Storage.Transforms.use('map_constructs', exports.MapConstructsTransform);

//////////
///// Codex Classes
exports.Codex = require("./codex");
