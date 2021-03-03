### dictadata.org: Open source software for Civic Data Engineering & Analytics

# @dictadata/storage-junctions 1.5.0

Node.js library for distributed data storage access and streaming transfers.

A storage junction provides a normalized, plug-in interface to a specific data source such as data file, database table, document collection, key/value store, etc.

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
      "keyOrdinal": 1,
      "label": "Foo"
    },
    "Bar": {
      "name": "Bar",
      "type": "integer",
      "size": 0,
      "default": null,
      "isNullable": true,
      "keyOrdinal": 0,
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
  count: 3,
  order: { "Bar": "desc" },
  fields: ["Foo","Bar","Baz"]
}
```

## Data Transforms

```json
// example transform with filter and field mapping
"transform": {
  "filter" {
    "match": {
      "Bar": "row",
      "Baz": { "gt": 100 }
      }
    },
    "drop": {
      "Baz": 5678
      }
    }
  },
  "select": {
    "inject_before": {
      "Fie": "where's fum?"
    },
    "fields": {
      "Foo": "Foo",
      "Bar": "Bar",
      "Baz": "Bazzy"
    },
    "remove": [ "Fobe" ],
    "inject_after": {
      "Fie": "override the fum"
    }
  }
}
```

### FilterTransform

```json
  // example filter transform

  transforms: {
    "filter": {
      // match all expressions to forward
      match: {
        "field1": 'value',
        "field2": {gt: 100, lt: 200}
      },
      // match all expressions to drop
      drop: {
        "field1": 'value',
        "field2": { lt: 0 }
        }
      }
    }
  };
```

### SelectTransform

```json
  // example fields transform

  transforms: {
    "select": {
      // inject new fields or set defaults in case of missing values
      "inject_before": {
        "newField": <value>
        "existingField": <default value>
      },

      // select a list of fields
      "fields": ["field1", "field2", ... ],
      // or select and map fields using dot notation
      // { src: dest, ...}
      "fields": {
        "field1": "Field1",
        "object1.subfield":  "FlatField"
      },

      // remove fields from the new construct
      "remove": ["field1", "field2"],

      // inject new fields or override existing values
      "inject_after": {
        "newField": <value>,
        "existingField": <override value>
      }

    }
  };
```

### order of operations

* inject_before
* select, mapping or copy
* remove
* inject_after

### AggregateTransform

Summarize and/or aggregate a stream of objects.  Functionality similar to SQL GROUP BY and aggregate functions like SUM or Elasticsearch's _search aggregations.

```json
  // example aggregate Summary transform
  // summary totals for field1
  // format "newField: { "function": "field name" }
  {
    "transforms": {
      "aggregate": {
        "mySum": {"sum": "myField"},
        "myMin": {"min": "myField"},
        "myMax": {"max": "myField"},
        "myAvg": {"avg": "myField"},
        "myCount": {"count": "myField"},
      }
    }
  }

  // Example aggregate Group By transform
  // format: "group by field": { "newField": { "function": "field name" }}
  {
    "transforms": {
      "aggregate": {
        "field1": {
          "subTotal": { "sum": "field2" } },
          "count": { "count": "field2" } }
      }
    }
  }
```

## Storage-Junctions Functions

### getEncoding()

### putEncoding(encoding)

### store(construct)

### recall(key)

### retrieve(pattern)

### createReadStream(options)

### createWriteStream(options)

### createTransform(tfType, options)

### getFileSystem()

## Transform Plugins

* Codify - Infer field encodings from examining a stream of objects.
* Aggregate - Summarize a data stream similar to SQL GROUP BY and SUM
* Fields - field selection and mappings.
* Filter - select constructs to forward or drop.
* MetaStats - calculate meta statistics about fields for a stream of constructs.

## FileSystem Plugins

* fs - Local file system support for Windwos, Linux and Mac iOS.
* ftp - FTP file transport protocal servers.
* s3 - AWS S3 storage.
