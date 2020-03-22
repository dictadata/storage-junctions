/**
 * @dictadata/storage-junctions
 */
"use strict";

var cortex = require("./lib/cortex");

module.exports = exports = cortex;

// other storage classes
exports.Engram = require("./lib/engram");
exports.Field = require("./lib/field");

let Types = exports.Types = require("./lib/types");
exports.StorageResults = Types.StorageResults;
exports.StorageError = Types.StorageError;

exports.StorageJunction = require("./lib/junction");
exports.StorageReader = require("./lib/junction/reader");
exports.StorageWriter = require("./lib/junction/writer");
exports.StorageTransform = require("./lib/junction/transform");
exports.CodifyWriter = require("./lib/junction/codify");

// standard filestorage systems
exports.fsFileStorage = require("./lib/filestorage/fs-filestorage")
cortex.useFS('fs', exports.fsFileStorage);

exports.ftpFileStorage = require("./lib/filestorage/ftp-filestorage")
cortex.useFS('ftp', exports.ftpFileStorage);

exports.s3FileStorage = require("./lib/filestorage/s3-filestorage")
cortex.useFS('s3', exports.s3FileStorage);

// standard junctions
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
