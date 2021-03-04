# @dictadata/storage-junctions 1.5.0

Node.js library for accessing distributed data storage, ETL transfers, analytics preparation and creating API services.

StorageJunction provides a normalized, plug-in interface to access disparate data sources such as data files, database tables, document collections, key/value stores, ... with one standarized interface.

## Installation

```bash
npm install @dictadata/storage-junctions
```

## Documentation

* [storage-junctions API Reference](docs/reference/index.md)
* [storage-junctions Programming Guide](docs/guide/index.md)

## Supported Storage Sources

| model         | encoding | store | recall | retrieve | dull  | streamable | key-value | documents | tables |
| ------------- | :------: | :---: | :----: | :------: | :---: | :--------: | :-------: | :-------: | :----: |
| csv           |   yes    |  no   |   no   |    -     |  no   |    yes     |    no     |    no     |  yes   |
| json          |   yes    |  no   |   no   |    -     |  no   |    yes     |    no     |    yes    |  yes   |
| parquet       |   yes    |  no   |   no   |    -     |  no   |    yes     |    no     |    yes    |  yes   |
| xlsx (Excel)  |   yes    |   -   |   -    |    -     |   -   |    yes     |    no     |    no     |  yes   |
| rest          |   yes    |   -   |   -    |   yes    |   -   |    yes     |     -     |     -     |  yes   |
| elasticsearch |   yes    |  yes  |  yes   |   yes    |  yes  |    yes     |    yes    |    yes    |  yes   |
| mssql         |   yes    |  yes  |  yes   |   yes    |  yes  |    yes     |    no     |     -     |  yes   |
| mysql         |   yes    |  yes  |  yes   |   yes    |  yes  |    yes     |    no     |     -     |  yes   |
| oracle        |   yes    |  yes  |  yes   |   yes    |  yes  |    yes     |    no     |     -     |  yes   |
| redshift      |   yes    |  yes  |  yes   |   yes    |  yes  |    yes     |    no     |     -     |  yes   |
| \*postgresql  |          |       |        |          |       |            |    no     |     -     |  yes   |
| \*mongodb     |          |       |        |          |       |            |    yes    |    yes    |  yes   |
| -memcache     |          |       |        |          |       |            |    yes    |    no     |   no   |

\* In the plans for future development.
&dash; Not planned, but will be developed as needed.

## Supported File Storage Systems

File Storage systems provide read and write streams to objects (files) on local and cloud storage systems.
GZip compression is handled seemlessly based on filename extension .gz.

| model        | list  | read  | write | scan  |
| ------------ | :---: | :---: | :---: | :---: |
| local        |  yes  |  yes  |  yes  |  yes  |
| FTP          |  yes  |  yes  |  yes  |  yes  |
| AWS S3       |  yes  |  yes  |  yes  |  yes  |
| \*scp        |   -   |   -   |   -   |   -   |
| \*Azure ADLS |   -   |   -   |   -   |   -   |
| \*Google CS  |   -   |   -   |   -   |   -   |

\* Not currently in plans for development.
&dash; Not planned, but will be developed as needed.

<hr class="line"/>

* [About this documentation](docs/documentation.md)
* [Usage and example](docs/synopsis.md)
* [Code repository and issue tracker](https://github.com/dictadata/storage-junctions)
  