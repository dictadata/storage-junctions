// junctions/oracledb

const OracleDBJunction = require("./oracledb-junction");

module.exports = exports = OracleDBJunction;
exports.OracleDBReader = require("./oracledb-reader");
exports.OracleDBWriter = require("./oracledb-writer");
exports.OracleEncoder = require("./oracledb-encoder");
