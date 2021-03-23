/**
 * @dictadata/storage-junctions
 */
"use strict";

var cortex = require("./cortex");
module.exports = exports = cortex;

exports.logger = require('./logger');

// other storage classes
const types = exports.types = require("./types");
exports.Engram = types.Engram;
exports.Field = types.Field;
exports.StorageResults = types.StorageResults;
exports.StorageError = types.StorageError;

// register transforms
exports.FilterTransform = require("./transforms/filter");
cortex.Transforms.use('filter', exports.FilterTransform);

exports.SelectTransform = require("./transforms/select");
cortex.Transforms.use('select', exports.SelectTransform);

exports.ComposeTransform = require("./transforms/compose");
cortex.Transforms.use('compose', exports.ComposeTransform);

exports.DecomposeTransform = require("./transforms/decompose");
cortex.Transforms.use('decompose', exports.DecomposeTransform);
cortex.Transforms.use('flatten', exports.DecomposeTransform);

exports.ConjoinTransform = require("./transforms/conjoin");
cortex.Transforms.use('conjoin', exports.ConjoinTransform);

exports.AggregateTransform = require("./transforms/aggregate");
cortex.Transforms.use('aggregate', exports.AggregateTransform);

exports.CodifyTransform = require("./transforms/codify");
cortex.Transforms.use('codify', exports.CodifyTransform);

exports.EncoderTransform = require("./transforms/encoder");
cortex.Transforms.use('encoder', exports.EncoderTransform);

exports.MetaStatsTransform = require("./transforms/metastats");
cortex.Transforms.use('metastats', exports.MetaStatsTransform);

// register standard StorageFileSystem's
exports.FileSystem = require("./filesystems/storage-filesystem");

exports.FSFileSystem = require("./filesystems/fs-filesystem");
cortex.FileSystems.use('file', exports.FSFileSystem);

exports.FTPFileSystem = require("./filesystems/ftp-filesystem");
cortex.FileSystems.use('ftp', exports.FTPFileSystem);

exports.HTTPFileSystem = require("./filesystems/http-filesystem");
cortex.FileSystems.use('http', exports.HTTPFileSystem);
cortex.FileSystems.use('https', exports.HTTPFileSystem);

// register standard junctions
var StorageJunction = require("./junctions/storage-junction");
exports.StorageJunction = StorageJunction;
exports.StorageReader = StorageJunction.StorageReader;
exports.StorageWriter = StorageJunction.StorageWriter;
cortex.use('*', StorageJunction, true);

var CSVJunction = require("./junctions/csv");
exports.CSVJunction = CSVJunction;
cortex.use('csv', CSVJunction, true);

var JSONJunction = require("./junctions/json");
exports.JSONJunction = JSONJunction;
cortex.use('json', JSONJunction, true);   // defaults to json array
cortex.use('jsons', JSONJunction, true);  // json stream
cortex.use('jsonl', JSONJunction, true);  // json line
cortex.use('jsona', JSONJunction, true);  // json array
cortex.use('jsono', JSONJunction, true);  // json object

var ShapesJunction = require("./junctions/shapes");
exports.ShapesJunction = ShapesJunction;
cortex.use('shp', ShapesJunction, true);

var ParquetJunction = require("./junctions/parquet");
exports.ParquetJunction = ParquetJunction;
cortex.use('parquet', ParquetJunction, true);

var ElasticsearchJunction = require("./junctions/elasticsearch");
exports.ElasticsearchJunction = ElasticsearchJunction;
cortex.use('elastic', ElasticsearchJunction);
cortex.use('elasticsearch', ElasticsearchJunction);

var MongoDBJunction = require("./junctions/mongodb");
exports.MongoDBJunction = MongoDBJunction;
cortex.use('mongodb', MongoDBJunction);

var MSSQLJunction = require("./junctions/mssql");
exports.MSSQLJunction = MSSQLJunction;
cortex.use('mssql', MSSQLJunction);

var MySQLJunction = require("./junctions/mysql");
exports.MySQLJunction = MySQLJunction;
cortex.use('mysql', MySQLJunction);

var OracleJunction = require("./junctions/oracle");
exports.OracleJunction = OracleJunction;
cortex.use('oracle', OracleJunction);

var RESTJunction = require("./junctions/rest");
exports.RESTJunction = RESTJunction;
cortex.use('rest', RESTJunction);

var SplitterJunction = require("./junctions/splitter");
exports.SplitterJunction = SplitterJunction;
cortex.use('splitter', SplitterJunction);
cortex.use('split', SplitterJunction);
