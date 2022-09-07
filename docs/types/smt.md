# Storage Memory Trace (SMT)

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

