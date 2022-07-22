# @dictadata/storage-junctions 2.3.x

_Storage Junctions_ is a Node.js library useful for creating apps that access distributed data sources, perform ETL transfers, prepare data for analytics and developing API services.

StorageJunction provides a normalized, plug-in interface to access disparate data sources such as data files, database tables, document collections, key/value stores, etc. with one standardized interface.

## Installation

```bash
npm install @dictadata/storage-junctions
```

## Documentation

[Storage Junctions Docs](https://github.com/dictadata/storage-junctions/docs/) contains documentation for dictadata's _Storage Junctions_ base types, classes, standard junctions and file systems needed to use the library.

[Storage Junctions Guide](https://gitlab.com/dictadata/storage-guide/docs/) explains the concepts behind dictadata's Storage System along with advanced examples.

## dictadata Projects

[Storage-ETL](https://github.com/dictadata/storage-etl) is command line interface (CLI) for using _Storage Junctions_ library to transfer data between data sources, perform data transformations and manage data schemas.

[Storage-Node](https://github.com/dictadata/storage-node) is a Node.js with Express.js based HTTP server application with extensible API services. A plugin framework supports all the base junctions and file systems from _Storage JUnctions_ library and custom plugins. Features `Codex` a data dictionary service to manage data sources and schemas amongst users and applications.

[Storage Plugins](https://github.com/dictadata/storage-junctions/docs/plugins.md) List of the various storage junctions and file system plugins that can be used with _Storage-ETL_ and _Storage-Node_.

## Supported Storage Sources

| model         | encoding | store | recall | retrieve | dull  | streamable | key-value | documents | tables |
| ------------- | :------: | :---: | :----: | :------: | :---: | :--------: | :-------: | :-------: | :----: |
| csv           |   yes    |  no   |   no   |    -     |  no   |    yes     |    no     |    no     |  yes   |
| json          |   yes    |  no   |   no   |    -     |  no   |    yes     |    no     |    yes    |  yes   |
| parquet       |   yes    |  no   |   no   |    -     |  no   |    yes     |    no     |    yes    |  yes   |
| elasticsearch |   yes    |  yes  |  yes   |   yes    |  yes  |    yes     |    yes    |    yes    |  yes   |
| memory        |          |       |        |          |       |            |    yes    |    no     |   no   |
| mssql         |   yes    |  yes  |  yes   |   yes    |  yes  |    yes     |    no     |     -     |  yes   |
| mysql         |   yes    |  yes  |  yes   |   yes    |  yes  |    yes     |    no     |     -     |  yes   |
| oracledb      |   yes    |  yes  |  yes   |   yes    |  yes  |    yes     |    no     |     -     |  yes   |
| redshift      |   yes    |  yes  |  yes   |   yes    |  yes  |    yes     |    no     |     -     |  yes   |
| rest          |   yes    |   -   |   -    |   yes    |   -   |    yes     |     -     |     -     |  yes   |
| shape files   |   yes    |  no   |  no    |   no     |  no   | read-only  |    no     |    no     |  yes   |
| xlsx (Excel)  |   yes    |   -   |   -    |    -     |   -   |    yes     |    no     |    no     |  yes   |
| \*mongodb     |          |       |        |          |       |            |    yes    |    yes    |  yes   |
| \*postgresql  |          |       |        |          |       |            |    no     |     -     |  yes   |

\* In the plans for future development.
&dash; Not planned, but will be developed as needed.

## Supported File Storage Systems

File Storage systems provide read and write streams to objects (files) on local and cloud storage systems.
GZip compression is handled seemlessly based on filename extension .gz.

| model        | list  | read  | write | scan  | upload | download |
| ------------ | :---: | :---: | :---: | :---: | :---:  |   :---:  |
| local        |  yes  |  yes  |  yes  |  yes  |   -    |     -    |
| FTP          |  yes  |  yes  |  yes  |  yes  |  yes   |    yes   |
| HTTP         |  yes  |  yes  |  \*no |  yes  |  yes   |   \*no   |
| AWS S3       |  yes  |  yes  |  yes  |  yes  |  yes   |    yes   |
| ZIP file     |  yes  |  yes  |  no   |  yes  |  no    |    yes   |
| \*scp        |   -   |   -   |   -   |   -   |   -    |     -    |
| \*Azure ADLS |   -   |   -   |   -   |   -   |   -    |     -    |
| \*Google CS  |   -   |   -   |   -   |   -   |   -    |     -    |

\* Not currently in plans for development.
&dash; Not planned, but will be developed as needed.

---

* [About this documentation](docs/documentation.md)
* [Usage and example](docs/synopsis.md)
* [Code repository and issue tracker](https://github.com/dictadata/storage-junctions)
  