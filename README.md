### dictadata.org: Open source software for Data Engineering & Analytics

# 1. @dictadata/storage-junctions 1.0.0

Node.js library for distributed data storage access and streaming transfers.

A storage junction provides a normalized, plug-in interface to a specific data source such as data file, database table, document collection, key/value store, etc.

<!-- TOC depthFrom:2 depthTo:2 -->autoauto- [1.1. Supported Storage Sources](#11-supported-storage-sources)auto- [1.2. Storage Memory Trace](#12-storage-memory-trace)auto- [1.3. SMT Key Formats](#13-smt-key-formats)auto- [1.4. Storage-Junctions Functions](#14-storage-junctions-functions)auto- [1.5. Storage Engram Encoding](#15-storage-engram-encoding)auto- [1.6. Storage Retrieval Pattern](#16-storage-retrieval-pattern)auto- [1.7. Storage Transforms](#17-storage-transforms)autoauto<!-- /TOC -->

## 1.1. Supported Storage Sources

| model         | encoding | store | recall | retrieve | dull | streamable | key-value | documents | tables |
| ------------- | :------: | :---: | :----: | :------: | :--: | :--------: | :-------: | :-------: | :----: |
| csv           |   yes    |  no   |   no   |    -     |  no  |    yes     |    no     |    no     |  yes   |
| json          |   yes    |  no   |   no   |    -     |  no  |    yes     |    no     |    yes    |  yes   |
| parquet       |   yes    |  no   |   no   |    -     |  no  |    yes     |    no     |    yes    |  yes   |
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

## 1.2. Storage Memory Trace

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

## 1.3. SMT Key Formats

| Format | Description                                                                                                                                                                                                                                                                                                                                  | Examples                                 |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| !      | Key. Keys are used to store and recall data. A single ! character denotes the data source assigns keys. Field names following a ! will be used to compute the key. Useful for key-value or document stores                                                                                                                                   | !<br /> !userid<br/> !lastname+firstname |
| =      | Primary key. Field name(s) must follow the = character. Values must be supplied for key fields when calling store, recall and dull functions. Useful for structured data like database tables.                                                                                                                                               | =userid<br/> =lastname+firstname.        |
| \*     | Any or All. If primary key(s) are specified in the schema encodings then this is effectively equivalent to = key format. Otherwise, \* is a generic place holder primarily used when the source is only used for searching or streaming transfers.                                                                                           | \*                                       |
| uid    | UID. A unique ID value (key) that addresses a specific piece of data on the data source. Similar to ! as the UID is a specific key. Used as the default value if no key is passed to store, recall and dull functions. Otherwise, the storage junction will behave the same as the bare ! key format. Rarely useful except in special cases. | 1234<br /> default                       |

## 1.4. Storage-Junctions Functions

### 1.4.1. getEncoding()

### 1.4.2. putEncoding(encoding)

### 1.4.3. store(construct)

### 1.4.4. recall(key)

### 1.4.5. retrieve(pattern)

### 1.4.6. getReadStream(options)

### 1.4.7. getWriteStream(options)

### 1.4.8. getTransform(options)

### 1.4.9. getCodifyWriter(options)

## 1.5. Storage Engram Encoding

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

## 1.6. Storage Retrieval Pattern

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

## 1.7. Storage Transforms

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
