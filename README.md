# @dicta-io/storage-junctions

A Node.js library for distributed data definition, storage, access, search and streaming.

A storage junction provides a simple interface to a data source such as formatted file, database or key value store.

## Current Data Sources

| model | store | recall | retrieve | stream |
| --- | :---: | :---: | :---: | :---: |
| csv | no | no | no | yes |
| json | no | no | no | yes |
| rest | - | - | yes | yes |
| elasticsearch | yes | yes | yes | yes |
| mysql | yes | no | yes | yes |
| mssql | | | |
| postgresql | | | |
| mongodb | | | |
| memcache | | | |

## Storage Memory Trace

A storage memory trace (SMT) is a data source definition.  It is made up of four parts.

| SMT | Description |
| --- | --- |
| model | The type of storage source which determines how to communicate with the storage source. |
| locus | The location or address of the data source such as a file folder, URL or database connection string. |
| schema | The name of the container that holds the data such as file name, database table, or bucket. |
| key | How to address data stored in the schema. | 

An SMT can be represented as string separated by pipe | characters or as a json object. Special characters in an SMT string can be URL encoded.

```
csv|/path/to/folder/|filename.csv|*
```

```json
{
  "model": "csv",
  "locus": "/path/to/folder/",
  "schema": "filename.csv",
  "key": "*"
}
````
## SMT Key Formats

| Format | Description | Examples |
| --- | --- | --- |
| ! | Key. Keys are used to store and recall data. A single ! character denotes the data source assigns keys.  Field names following a ! will be used to compute the key. Useful for key-value or document stores | !<br /> !userid<br/> !lastname+firstname |
| = | Primary key. Field name(s) must follow the = character.  Values must be supplied for key fields when calling store, recall and dull functions. Useful for structured data like database tables. | =userid<br/> =lastname+firstname. |
| * | Any or All. If primary key(s) are specified in the schema encodings then this is effectively equivalent to = key format. Otherwise, * is a generic place holder primarily used when the source is only used for searching or streaming transfers. | * |
| uid | UID. A unique ID value (key) that addresses a specific piece of data on the data source. Similar to ! as the UID is a specific key. Used as the default value if no key is passed to store, recall and dull functions. Otherwise, the storage junction will behave the same as the bare ! key format. Rarely useful except in special cases. | 1234<br /> default |

## Storage-Junctions Functions

### getEncoding()

### putEncoding(encoding)

### store(construct)

### recall(key)

### retrieve(pattern)

### getReadStream()

### getWriteStream()

### getTransform(transforms)

### getCodifyTransform()


## Storage Engram Encoding

```json
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
```

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
"transforms": {
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
