/**
 * @dicta-io/storage-junctions
 */
"use strict";

var cortex = require("./lib/cortex");

exports = module.exports = cortex;

// other storage classes
exports.Engram = require("./lib/engram");
exports.Encoding = require("./lib/encoding");
exports.Field = require("./lib/field");
exports.Types = require("./lib/types");

// standard junctions
var CsvJunction = require("./lib/csv");
cortex.use('csv',CsvJunction);
exports.CsvJunction = CsvJunction;

var ElasticsearchJunction = require("./lib/elasticsearch");
cortex.use('elasticsearch',ElasticsearchJunction);
exports.ElasticsearchJunction = ElasticsearchJunction;

var JsonJunction = require("./lib/json");
cortex.use('json',JsonJunction);
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

var RestJunction = require("./lib/rest");
cortex.use('rest',RestJunction);
exports.RestJunction = RestJunction;
