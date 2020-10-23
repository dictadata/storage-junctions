/**
 * @dictadata/storage-junctions
 */
"use strict";

var cortex = require("./cortex");

module.exports = exports = cortex;

exports.logger = require('./logger');

// other storage classes
exports.Engram = require("./engram");
exports.Field = require("./field");

let Types = exports.Types = require("./types");
exports.StorageResults = Types.StorageResults;
exports.StorageError = Types.StorageError;

exports.StorageJunction = require("./junction");
exports.StorageReader = require("./junction/reader");
exports.StorageWriter = require("./junction/writer");

// register transforms
exports.CodifyTransform = require("./transforms/codify");
cortex.Transforms.use('codify', exports.CodifyTransform);

exports.ConjoinTransform = require("./transforms/conjoin");
cortex.Transforms.use('conjoin', exports.ConjoinTransform);

exports.AggregateTransform = require("./transforms/aggregate");
cortex.Transforms.use('aggregate', exports.AggregateTransform);

exports.SelectTransform = require("./transforms/select");
cortex.Transforms.use('select', exports.SelectTransform);

exports.FilterTransform = require("./transforms/filter");
cortex.Transforms.use('filter', exports.FilterTransform);

exports.MetaStatsTransform = require("./transforms/metastats");
cortex.Transforms.use('metastats', exports.MetaStatsTransform);

// register standard StorageFileSystem's
exports.FileSystem = require("./filesystems");

exports.FSFileSystem = require("./filesystems/fs-filesystem");
cortex.FileSystems.use('file', exports.FSFileSystem);

exports.FtpFileSystem = require("./filesystems/ftp-filesystem");
cortex.FileSystems.use('ftp', exports.FtpFileSystem);

exports.HttpFileSystem = require("./filesystems/http-filesystem");
cortex.FileSystems.use('http', exports.HttpFileSystem);
cortex.FileSystems.use('https', exports.HttpFileSystem);

exports.S3FileSystem = require("./filesystems/s3-filesystem");
cortex.FileSystems.use('s3', exports.S3FileSystem);

// register standard junctions
cortex.use('*', exports.StorageJunction, true);

var CsvJunction = require("./csv");
exports.CsvJunction = CsvJunction;
cortex.use('csv', CsvJunction, true);

var JsonJunction = require("./json");
exports.JsonJunction = JsonJunction;
cortex.use('json', JsonJunction, true);   // defaults to json array
cortex.use('jsons', JsonJunction, true);  // json stream
cortex.use('jsonl', JsonJunction, true);  // json line
cortex.use('jsona', JsonJunction, true);  // json array
cortex.use('jsono', JsonJunction, true);  // json object

var ShapeFilesJunction = require("./shp");
exports.ShapeFilesJunction = ShapeFilesJunction;
cortex.use('shp', ShapeFilesJunction, true);

var ParquetJunction = require("./parquet");
exports.ParquetJunction = ParquetJunction;
cortex.use('parquet', ParquetJunction, true);

var XlsxJunction = require("./xlsx");
exports.XlsxJunction = XlsxJunction;
cortex.use('xlsx', XlsxJunction);
cortex.use('xls', XlsxJunction);
cortex.use('ods', XlsxJunction);

var ElasticsearchJunction = require("./elasticsearch");
exports.ElasticsearchJunction = ElasticsearchJunction;
cortex.use('elastic', ElasticsearchJunction);
cortex.use('elasticsearch', ElasticsearchJunction);

var MongoDBJunction = require("./mongodb");
exports.MongoDBJunction = MongoDBJunction;
cortex.use('mongodb', MongoDBJunction);

var MSSQLJunction = require("./mssql");
exports.MSSQLJunction = MSSQLJunction;
cortex.use('mssql', MSSQLJunction);

var MySQLJunction = require("./mysql");
exports.MySQLJunction = MySQLJunction;
cortex.use('mysql', MySQLJunction);

var PostgreSQLJunction = require("./postgresql");
exports.PostgreSQLJunction = PostgreSQLJunction;
cortex.use('postgresql', PostgreSQLJunction);
cortex.use('postgres', PostgreSQLJunction);

var RestJunction = require("./rest");
exports.RestJunction = RestJunction;
cortex.use('rest', RestJunction);
