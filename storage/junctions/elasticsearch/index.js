// storage/junctions/elasticsearch

const ElasticsearchJunction = require('./elasticsearch-junction');

module.exports = exports = ElasticsearchJunction;
exports.ElasticsearchReader = require('./elasticsearch-reader');
exports.ElasticsearchWriter = require('./elasticsearch-writer');
exports.ElasticsearchEncoder = require('./elasticsearch-encoder');
