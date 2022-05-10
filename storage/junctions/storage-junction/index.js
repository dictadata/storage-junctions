// junctions/storage

const StorageJunction = require("./storage-junction");

module.exports = exports = StorageJunction;
exports.StorageReader = require("./storage-reader");
exports.StorageWriter = require("./storage-writer");
exports.StorageEncoder = require("./storage-encoder");
