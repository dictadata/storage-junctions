/**
 * @dictadata/storage-junctions
 *
 * Exposes Class types for:
 *   StorageJunction, FileSystems, Transforms
 *
 * Registers standard implementations of several:
 *   StorageJunctions, FileSystems, Transforms
 */

var Storage = require('./storage');
exports.Storage = Storage;

//////////
///// register Storage FileSystems
exports.StorageFileSystem = require('./filesystems/storage-filesystem');

exports.FSFileSystem = require('./filesystems/fs-filesystem');
Storage.FileSystems.use('file', exports.FSFileSystem);

exports.FTPFileSystem = require('./filesystems/ftp-filesystem');
Storage.FileSystems.use('ftp', exports.FTPFileSystem);

exports.HTTPFileSystem = require('./filesystems/http-filesystem');
Storage.FileSystems.use('http', exports.HTTPFileSystem);
Storage.FileSystems.use('https', exports.HTTPFileSystem);

exports.StreamFileSystem = require('./filesystems/stream-filesystem');
Storage.FileSystems.use('stream', exports.StreamFileSystem);

exports.ZipFileSystem = require('./filesystems/zip-filesystem');
Storage.FileSystems.use('zip', exports.ZipFileSystem);

//////////
///// register Storage Junctions
var StorageJunction = require('./junctions/storage-junction');
exports.StorageJunction = StorageJunction;
exports.StorageEncoder = StorageJunction.StorageEncoder;
exports.StorageReader = StorageJunction.StorageReader;
exports.StorageWriter = StorageJunction.StorageWriter;
exports.StorageTransform = StorageJunction.StorageTransform;
Storage.Junctions.use('*', StorageJunction);

var CSVJunction = require('./junctions/csv');
exports.CSVJunction = CSVJunction;
Storage.Junctions.use('csv', CSVJunction);

var JSONJunction = require('./junctions/json');
exports.JSONJunction = JSONJunction;
Storage.Junctions.use('json', JSONJunction);   // defaults to json array
Storage.Junctions.use('jsons', JSONJunction);  // json stream
Storage.Junctions.use('jsonl', JSONJunction);  // json line
Storage.Junctions.use('jsona', JSONJunction);  // json array
Storage.Junctions.use('jsono', JSONJunction);  // json object
Storage.Junctions.use('jsonw', JSONJunction);  // json stream writer

var ParquetJunction = require('./junctions/parquet');
exports.ParquetJunction = ParquetJunction;
Storage.Junctions.use('parquet', ParquetJunction);

var ElasticsearchJunction = require('./junctions/elasticsearch');
exports.ElasticsearchJunction = ElasticsearchJunction;
Storage.Junctions.use('elastic', ElasticsearchJunction);
Storage.Junctions.use('elasticsearch', ElasticsearchJunction);

var MySQLJunction = require('./junctions/mysql');
exports.MySQLJunction = MySQLJunction;
Storage.Junctions.use('mysql', MySQLJunction);

var RESTJunction = require('./junctions/rest');
exports.RESTJunction = RESTJunction;
Storage.Junctions.use('rest', RESTJunction);

var ShapefileJunction = require('./junctions/shapefile');
exports.ShapefileJunction = ShapefileJunction;
Storage.Junctions.use('shapefile', ShapefileJunction);
Storage.Junctions.use('shp', ShapefileJunction);

var TextJunction = require('./junctions/text');
exports.TextJunction = TextJunction;
Storage.Junctions.use('txt', TextJunction);
Storage.Junctions.use('text', TextJunction);

var NullWriterJunction = require('./junctions/nullwriter');
exports.NullWriterJunction = NullWriterJunction;
Storage.Junctions.use('null', NullWriterJunction);

var MemoryJunction = require('./junctions/memory');
exports.MemoryJunction = MemoryJunction;
Storage.Junctions.use('memory', MemoryJunction);

var TemplateJunction = require('./junctions/template');
exports.TemplateJunction = TemplateJunction;
Storage.Junctions.use('template', TemplateJunction);

//////////
///// register Storage Transforms
exports.FilterTransform = require('./transforms/filter');
Storage.Transforms.use('filter', exports.FilterTransform);

exports.MutateTransform = require('./transforms/mutate');
Storage.Transforms.use('mutate', exports.MutateTransform);

exports.ComposeTransform = require('./transforms/compose');
Storage.Transforms.use('compose', exports.ComposeTransform);

exports.DecomposeTransform = require('./transforms/decompose');
Storage.Transforms.use('decompose', exports.DecomposeTransform);
Storage.Transforms.use('flatten', exports.DecomposeTransform);

exports.AdjoinTransform = require('./transforms/adjoin');
Storage.Transforms.use('adjoin', exports.AdjoinTransform);

exports.ConjoinTransform = require('./transforms/conjoin');
Storage.Transforms.use('conjoin', exports.ConjoinTransform);

exports.AggregateTransform = require('./transforms/aggregate');
Storage.Transforms.use('aggregate', exports.AggregateTransform);

exports.CodifyTransform = require('./transforms/codify');
Storage.Transforms.use('codify', exports.CodifyTransform);

exports.EncoderTransform = require('./transforms/encoder');
Storage.Transforms.use('encoder', exports.EncoderTransform);

exports.CounterTransform = require('./transforms/counter');
Storage.Transforms.use('counter', exports.CounterTransform);

exports.FlowStatsTransform = require('./transforms/flowstats');
Storage.Transforms.use('flowstats', exports.FlowStatsTransform);

exports.ArrayAsConstructTransform = require('./transforms/arrayAsConstruct');
Storage.Transforms.use('rowAsConstruct', exports.ArrayAsConstructsTransform);

exports.MapToConstructsTransform = require('./transforms/mapToConstructs');
Storage.Transforms.use('mapAsConstructs', exports.MapToConstructsTransform);
