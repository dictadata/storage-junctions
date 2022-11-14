# @dictadata/storage-junctions 0.9.x

_Storage Junctions_ is a Node.js library useful for creating apps that access distributed data sources, perform ETL transfers, prepare data for analytics and developing API services.

StorageJunction provides a normalized, plug-in interface to access disparate data sources such as data files, database tables, document collections, key/value stores, etc. with one standardized interface.

## Installation

```bash
npm install @dictadata/storage-junctions
```

## Getting Started

## Documentation

[Storage Junctions](https://github.com/dictadata/storage-junctions/docs/) contains documentation for _dictadata Storage Junctions_ base types, classes, standard junctions and file systems needed to use the library.

[Supported Storage Sources](docs/junctions/) many junctions are available for popular data sources such as **CSV, JSON, Excel, PDF, REST API, Geo Shape files, MySQL, Microsoft SQL Server, ElasticSearch, Oracle DB, Amazon Redshift**.  Any data source can be support via a plugin.

[Supported File Systems](docs/filesystems/) many file systems are available such as **FTP, HTTP, Amazon S3, ZIP and local files**.  Any file based source can be support via a plugin.

[Usage and example](docs/examples/)

## Related Projects

[Storage-ETL](https://github.com/dictadata/storage-etl) is command line interface (CLI) for using _Storage Junctions_ library to transfer data between data sources, perform data transformations and manage data schemas.

[Storage-Node](https://github.com/dictadata/storage-node) is a Node.js with Express.js based HTTP server application with extensible API services. A plugin framework supports all the base junctions and file systems from _Storage Junctions_ library and custom plugins. Features `Codex` a data dictionary service to manage data sources and schemas amongst users and applications.

[Storage Plugins](https://github.com/dictadata/storage-junctions/docs/plugins.md) List of the various storage junctions and file system plugins that can be used with _Storage-ETL_ and _Storage-Node_.

---

* [Code repository and issue tracker](https://github.com/dictadata/storage-junctions)
  