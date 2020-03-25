### dictadata.org: Open source software for Data Engineering & Analytics

# @dictadata/storage-junctions 1.1.0

Node.js library for distributed data storage access and streaming transfers.

A storage junction provides a normalized, plug-in interface to a specific data source such as data file, database table, document collection, key/value store, etc.

## Supported Storage Sources

| model         | encoding | store | recall | retrieve | dull | streamable | key-value | documents | tables |
| ------------- | :------: | :---: | :----: | :------: | :--: | :--------: | :-------: | :-------: | :----: |
| csv           |   yes    |  no   |   no   |    -     |  no  |    yes     |    no     |    no     |  yes   |
| json          |   yes    |  no   |   no   |    -     |  no  |    yes     |    no     |    yes    |  yes   |
| parquet       |   yes    |  no   |   no   |    -     |  no  |    yes     |    no     |    yes    |  yes   |
| xlsx (Excel)  |   yes    |   -   |   -    |    -     |  -   |    yes     |    no     |    no     |  yes   |
| rest          |   yes    |   -   |   -    |   yes    |  -   |    yes     |     -     |     -     |  yes   |
| elasticsearch |   yes    |  yes  |  yes   |   yes    | yes  |    yes     |    yes    |    yes    |  yes   |
| mysql         |   yes    |  yes  |  yes   |   yes    | yes  |    yes     |    no     |     -     |  yes   |
| redshift      |   yes    |  yes  |  yes   |   yes    | yes  |    yes     |    no     |     -     |  yes   |
| \*mssql       |          |       |        |          |      |            |    no     |     -     |  yes   |
| \*postgresql  |          |       |        |          |      |            |    no     |     -     |  yes   |
| \*mongodb     |          |       |        |          |      |            |    yes    |    yes    |  yes   |
| -memcache     |          |       |        |          |      |            |    yes    |    no     |   no   |

\* In the plans for future development.
&dash; Not planned, but will be developed as needed.

## Supported File Storage Systems

File Storage systems provide read and write streams to objects (files) on local and cloud storage systems.
GZip compression is handled seemlessly based on filename extension .gz.

| model         |  list | read  | write | scan  |
| ------------- | :---: | :---: | :---: | :---: |
| local         |  yes  |  yes  |  yes  |  yes  |
| FTP           |  yes  |  yes  |  yes  |  yes  |
| AWS S3        |  yes  |  yes  |  yes  |  yes  |
| \*Azure ADLS  |   -   |   -   |   -   |   -   |
| \*Google CS   |   -   |   -   |   -   |   -   |

\* Not currently in plans for development.
&dash; Not planned, but will be developed as needed.

## Storage Memory Trace

A storage memory trace (SMT) is a data source definition. It is made up of four parts.

| SMT    | Description                                                                                          |
| ------ | ---------------------------------------------------------------------------------------------------- |
| model  | The type of storage source which determines how to communicate with the storage source.              |
| locus  | The location or address of the data source such as a file folder, URL or database connection string. |
| schema | The name of the container that holds the data such as file name, table, collection or bucket.        |
| key    | In addition to defining a key it determines how to address data stored in the schema.                |

An SMT can be represented as string separated by pipe | characters or as a json object. Special characters in an SMT string should be URL encoded.

```php
csv|/path/to/folder/|filename.csv|*
mysql|connection string|talblename|=column1,column2
elastic|node address|index|!field
```

```json
{
  "model": "mysql",
  "locus": "connection string",
  "schema": "tablename",
  "key": "=column1,column2"
}
```

## SMT Key Formats

| Format | Description                                                                                                                                                                                                                                                                                                                                  | Examples                                 |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| !      | Key. Keys are used to store and recall data. A single ! character denotes the data source assigns keys. Field names following a ! will be used to compute the key. Useful for key-value or document stores                                                                                                                                   | !<br /> !userid<br/> !lastname+firstname |
| =      | Primary key. Field name(s) must follow the = character. Values must be supplied for key fields when calling store, recall and dull functions. Useful for structured data like database tables.                                                                                                                                               | =userid<br/> =lastname+firstname.        |
| \*     | Any or All. If primary key(s) are specified in the schema encodings then this is effectively equivalent to = key format. Otherwise, \* is a generic place holder primarily used when the source is only used for searching or streaming transfers.                                                                                           | \*                                       |
| uid    | UID. A unique ID value (key) that addresses a specific piece of data on the data source. Similar to ! as the UID is a specific key. Used as the default value if no key is passed to store, recall and dull functions. Otherwise, the storage junction will behave the same as the bare ! key format. Rarely useful except in special cases. | 1234<br /> default                       |

## Storage-Junctions Functions

### getEncoding()

### putEncoding(encoding)

### store(construct)

### recall(key)

### retrieve(pattern)

### getReadStream(options)

### getWriteStream(options)

### getFieldTransform(options)

### getCodifyWriter(options)

## Storage Engram Encoding

````json
{
  "model": "*",
  "locus": "*",
  "schema": "my_schema",
  "key": "=Foo",
  "fields": {
    "Foo": {
      "name": "Foo",
      "type": "keyword",
      "size": 0,
      "default": null,
      "isNullable": false,
      "isKey": true,
      "label": "Foo"
    },
    "Bar": {
      "name": "Bar",
      "type": "integer",
      "size": 0,
      "default": null,
      "isNullable": true,
      "isKey": false,
      "label": "Bar"
    },```
    ...
  }
}
````

## Storage Retrieval Pattern

```json
pattern: {
  match: {
    "Foo": "first",
    "Bar": { "gte": 0, "lte": 1000 }
  },
  cues: {
    count: 3,
    order: { "Bar": "desc" },
    fields: ["Foo","Bar","Baz"]
  }
}
```

## Storage Transforms

```json
"transform": {
  "inject": {
    "Fie": "where's fum?"
  },
  "match": {
    "Bar": {
      "op": "eq",
      "value": "row"
    }
  },
  "drop": {
    "Baz": {
      "op": "eq",
      "value": 5678
    }
  },
  "mapping": {
    "Foo": "Foo",
    "Bar": "Bar",
    "Baz": "Bazzy"
  }
}
```
