// junctions/oracledb

const OracleDBJunction = require("./oracledb-junction");

module.exports = exports = OracleDBJunction;
exports.OracleDBReader = require("./oracledb-reader");
exports.OracleDBWriter = require("./oracledb-writer");
exports.OracleDBEncoder = require("./oracledb-encoder");
exports.OracleDBSQLEncoder = require("./oracledb-sql-encoder");
