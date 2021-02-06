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

exports.StorageJunction = require("./storage-junction");
exports.StorageReader = require("./storage-junction/reader");
exports.StorageWriter = require("./storage-junction/writer");

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

exports.MetaStatsTransform = require("./transforms/metastats");
cortex.Transforms.use('metastats', exports.MetaStatsTransform);

// register standard StorageFileSystem's
exports.FileSystem = require("./storage-filesystem");

exports.FSFileSystem = require("./fs-filesystem");
cortex.FileSystems.use('file', exports.FSFileSystem);

exports.FtpFileSystem = require("./ftp-filesystem");
cortex.FileSystems.use('ftp', exports.FtpFileSystem);

exports.HttpFileSystem = require("./http-filesystem");
cortex.FileSystems.use('http', exports.HttpFileSystem);
cortex.FileSystems.use('https', exports.HttpFileSystem);

exports.S3FileSystem = require("./s3-filesystem");
cortex.FileSystems.use('s3', exports.S3FileSystem);

// register standard junctions
cortex.use('*', exports.StorageJunction, true);

var CsvJunction = require("./csv-junction");
exports.CsvJunction = CsvJunction;
cortex.use('csv', CsvJunction, true);

var JsonJunction = require("./json-junction");
exports.JsonJunction = JsonJunction;
cortex.use('json', JsonJunction, true);   // defaults to json array
cortex.use('jsons', JsonJunction, true);  // json stream
cortex.use('jsonl', JsonJunction, true);  // json line
cortex.use('jsona', JsonJunction, true);  // json array
cortex.use('jsono', JsonJunction, true);  // json object

var ShapesJunction = require("./shapes-junction");
exports.ShapesJunction = ShapesJunction;
cortex.use('shp', ShapesJunction, true);

var ParquetJunction = require("./parquet-junction");
exports.ParquetJunction = ParquetJunction;
cortex.use('parquet', ParquetJunction, true);

var XlsxJunction = require("./xlsx-junction");
exports.XlsxJunction = XlsxJunction;
cortex.use('xlsx', XlsxJunction);
cortex.use('xls', XlsxJunction);
cortex.use('ods', XlsxJunction);

var ElasticsearchJunction = require("./elasticsearch-junction");
exports.ElasticsearchJunction = ElasticsearchJunction;
cortex.use('elastic', ElasticsearchJunction);
cortex.use('elasticsearch', ElasticsearchJunction);

var MongoDBJunction = require("./mongodb-junction");
exports.MongoDBJunction = MongoDBJunction;
cortex.use('mongodb', MongoDBJunction);

var MSSQLJunction = require("./mssql-junction");
exports.MSSQLJunction = MSSQLJunction;
cortex.use('mssql', MSSQLJunction);

var MySQLJunction = require("./mysql-junction");
exports.MySQLJunction = MySQLJunction;
cortex.use('mysql', MySQLJunction);

var OracleJunction = require("./oracle-junction");
exports.OracleJunction = OracleJunction;
cortex.use('oracle', OracleJunction);

var PostgreSQLJunction = require("./postgresql-junction");
exports.PostgreSQLJunction = PostgreSQLJunction;
cortex.use('postgresql', PostgreSQLJunction);
cortex.use('postgres', PostgreSQLJunction);

var RestJunction = require("./rest-junction");
exports.RestJunction = RestJunction;
cortex.use('rest', RestJunction);
