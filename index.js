/**
 * @dictadata/storage-junctions
 */
"use strict";

var cortex = require("./lib/cortex");

exports = module.exports = cortex;

// other storage classes
exports.Engram = require("./lib/engram");
exports.Field = require("./lib/field");
exports.Types = require("./lib/types");

exports.StorageError = require("./lib/storage_error");

// standard junctions
var CsvJunction = require("./lib/csv");
cortex.use('csv',CsvJunction);
exports.CsvJunction = CsvJunction;

var ElasticsearchJunction = require("./lib/elasticsearch");
cortex.use('elasticsearch',ElasticsearchJunction);
exports.ElasticsearchJunction = ElasticsearchJunction;

var JsonJunction = require("./lib/json");
cortex.use('json',JsonJunction);   // defaults to json array
cortex.use('jsons',JsonJunction);  // json stream
cortex.use('jsonl',JsonJunction);  // json line
cortex.use('jsona',JsonJunction);  // json array
cortex.use('jsono',JsonJunction);  // json object
exports.JsonJunction = JsonJunction;

var MongoDBJunction = require("./lib/mongodb");
cortex.use('mongodb',MongoDBJunction);
exports.MongoDBJunction = MongoDBJunction;

var MSSQLJunction = require("./lib/mssql");
cortex.use('mssql',MSSQLJunction);
exports.MSSQLJunction = MSSQLJunction;

var MySQLJunction = require("./lib/mysql");
cortex.use('mysql',MySQLJunction);
exports.MySQLJunction = MySQLJunction;

var PostgreSQLJunction = require("./lib/postgresql");
cortex.use('postgresql',PostgreSQLJunction);
cortex.use('postgres',PostgreSQLJunction);
exports.PostgreSQLJunction = PostgreSQLJunction;

var RestJunction = require("./lib/rest");
cortex.use('rest',RestJunction);
exports.RestJunction = RestJunction;
