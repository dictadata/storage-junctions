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

// register standard filestorage systems
exports.fsFileStorage = require("./filestorage/fs-filestorage");
cortex.FileStorage.use('fs', exports.fsFileStorage);

exports.ftpFileStorage = require("./filestorage/ftp-filestorage");
cortex.FileStorage.use('ftp', exports.ftpFileStorage);

exports.httpFileStorage = require("./filestorage/http-filestorage");
cortex.FileStorage.use('http', exports.httpFileStorage);
cortex.FileStorage.use('https', exports.httpFileStorage);

exports.s3FileStorage = require("./filestorage/s3-filestorage");
cortex.FileStorage.use('s3', exports.s3FileStorage);

// register standard junctions
var CsvJunction = require("./csv");
cortex.use('csv', CsvJunction);
exports.CsvJunction = CsvJunction;

var JsonJunction = require("./json");
cortex.use('json', JsonJunction);   // defaults to json array
cortex.use('jsons', JsonJunction);  // json stream
cortex.use('jsonl', JsonJunction);  // json line
cortex.use('jsona', JsonJunction);  // json array
cortex.use('jsono', JsonJunction);  // json object
exports.JsonJunction = JsonJunction;

var ShapesJunction = require("./shapes");
cortex.use('shapes', ShapesJunction);
exports.ShapesJunction = ShapesJunction;

var ParquetJunction = require("./parquet");
cortex.use('parquet', ParquetJunction);
exports.ParquetJunction = ParquetJunction;

var XlsxJunction = require("./xlsx");
cortex.use('xlsx', XlsxJunction);
cortex.use('xls', XlsxJunction);
cortex.use('ods', XlsxJunction);
exports.XlsxJunction = XlsxJunction;

var ElasticsearchJunction = require("./elasticsearch");
cortex.use('elastic', ElasticsearchJunction);
cortex.use('elasticsearch', ElasticsearchJunction);
exports.ElasticsearchJunction = ElasticsearchJunction;

var MongoDBJunction = require("./mongodb");
cortex.use('mongodb', MongoDBJunction);
exports.MongoDBJunction = MongoDBJunction;

var MSSQLJunction = require("./mssql");
cortex.use('mssql', MSSQLJunction);
exports.MSSQLJunction = MSSQLJunction;

var MySQLJunction = require("./mysql");
cortex.use('mysql', MySQLJunction);
exports.MySQLJunction = MySQLJunction;

var PostgreSQLJunction = require("./postgresql");
cortex.use('postgresql', PostgreSQLJunction);
cortex.use('postgres', PostgreSQLJunction);
exports.PostgreSQLJunction = PostgreSQLJunction;

var RestJunction = require("./rest");
cortex.use('rest', RestJunction);
exports.RestJunction = RestJunction;
