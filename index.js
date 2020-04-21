/**
 * @dictadata/storage-junctions
 */
"use strict";

var cortex = require("./lib/cortex");

module.exports = exports = cortex;

exports.logger = require('./lib/logger');

// other storage classes
exports.Engram = require("./lib/engram");
exports.Field = require("./lib/field");

let Types = exports.Types = require("./lib/types");
exports.StorageResults = Types.StorageResults;
exports.StorageError = Types.StorageError;

exports.StorageJunction = require("./lib/junction");
exports.StorageReader = require("./lib/junction/reader");
exports.StorageWriter = require("./lib/junction/writer");

// register transforms
exports.CodifyTransform = require("./lib/transforms/codify");
cortex.Transforms.use('codify', exports.CodifyTransform);

exports.ConjoinTransform = require("./lib/transforms/conjoin");
cortex.Transforms.use('conjoin', exports.ConjoinTransform);

exports.ConsolidateTransform = require("./lib/transforms/consolidate");
cortex.Transforms.use('consolidate', exports.ConsolidateTransform);

exports.SelectTransform = require("./lib/transforms/select");
cortex.Transforms.use('select', exports.SelectTransform);

exports.FilterTransform = require("./lib/transforms/filter");
cortex.Transforms.use('filter', exports.FilterTransform);

exports.MetaStatsTransform = require("./lib/transforms/metastats");
cortex.Transforms.use('metastats', exports.MetaStatsTransform);

// register standard filestorage systems
exports.fsFileStorage = require("./lib/filestorage/fs-filestorage")
cortex.FileStorage.use('fs', exports.fsFileStorage);

exports.ftpFileStorage = require("./lib/filestorage/ftp-filestorage")
cortex.FileStorage.use('ftp', exports.ftpFileStorage);

exports.s3FileStorage = require("./lib/filestorage/s3-filestorage")
cortex.FileStorage.use('s3', exports.s3FileStorage);

// register standard junctions
var CsvJunction = require("./lib/csv");
cortex.use('csv', CsvJunction);
exports.CsvJunction = CsvJunction;

var JsonJunction = require("./lib/json");
cortex.use('json', JsonJunction);   // defaults to json array
cortex.use('jsons', JsonJunction);  // json stream
cortex.use('jsonl', JsonJunction);  // json line
cortex.use('jsona', JsonJunction);  // json array
cortex.use('jsono', JsonJunction);  // json object
exports.JsonJunction = JsonJunction;

var ParquetJunction = require("./lib/parquet");
cortex.use('parquet', ParquetJunction);
exports.ParquetJunction = ParquetJunction;

var XlsxJunction = require("./lib/xlsx");
cortex.use('xlsx', XlsxJunction);
cortex.use('xls', XlsxJunction);
cortex.use('ods', XlsxJunction);
exports.XlsxJunction = XlsxJunction;

var ElasticsearchJunction = require("./lib/elasticsearch");
cortex.use('elastic', ElasticsearchJunction);
cortex.use('elasticsearch', ElasticsearchJunction);
exports.ElasticsearchJunction = ElasticsearchJunction;

var MongoDBJunction = require("./lib/mongodb");
cortex.use('mongodb', MongoDBJunction);
exports.MongoDBJunction = MongoDBJunction;

var MSSQLJunction = require("./lib/mssql");
cortex.use('mssql', MSSQLJunction);
exports.MSSQLJunction = MSSQLJunction;

var MySQLJunction = require("./lib/mysql");
cortex.use('mysql', MySQLJunction);
exports.MySQLJunction = MySQLJunction;

var PostgreSQLJunction = require("./lib/postgresql");
cortex.use('postgresql', PostgreSQLJunction);
cortex.use('postgres', PostgreSQLJunction);
exports.PostgreSQLJunction = PostgreSQLJunction;

var RestJunction = require("./lib/rest");
cortex.use('rest', RestJunction);
exports.RestJunction = RestJunction;
