// junctions/mongodb

const MongoDBJunction = require("./mongodb-junction");

module.exports = exports = MongoDBJunction;
exports.MongoDBReader = require("./mongodb-reader");
exports.MongoDBWriter = require("./mongodb-writer");
//exports.MongoDBEncoder = require("./mongodb-encoder");
