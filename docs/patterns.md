# Storage Patterns

Storage patterns are search expressions represented as objects and used by storage-junctions to query a data source. Each storage junction will convert the pattern to the source's query syntax such as SQL statements or Elasticsearch DSL.

## Characteristics of Storage Patterns

- Depending upon the data source's capabilities a storage-junction may:
  - Not support retrieval queries.
  - Only support a subset of retrieval patterns.
  - Support all retrieval patterns.

- All storage-junctions use the same syntax and semantics for retrieval patterns.
  - If a source feature is not available then the storage-junction will not implement the pattern.
  - If a source feature is available, but not implemented in a storage-junction then it needs to be implemented.
  - Storage Junctions will not support data source specific features that cannot be generalized across all storage junctions.

## Properties

A pattern contain zero or more of the following properties.

match : Object
  : query expression for lookup or filtering constructs at source.

operator: String
  : operational modifier for match expression.

fields : Array
  : select fields to be returned by source.

count : Integer
  : number of constructs source should return in results.

order : Object
  : have source order (sort) the results.
  { 'field_name': "asc" | "desc" }

## Match Operators

The general syntax of a match expression is:

```javascript
let pattern = {
  match: {
    'field_name': { 'operator': value }
  }
}
```

Note, for constructs that contain nested fields field_name supports dot notation.

```javascript
 match: {
    'order.order_num': { 'eq': "abc123" }
  }
```

### Comparison Operators

- 'eq' - equals
- 'neq' - not equals
- 'gt' - greater than
- 'lt' - less than
- 'gte' - greater than or equal
- 'lte' - less than or equal

### Text Search Operators

- 'wc' - value contains wildcard characters '*' or '?'
- 'search' - full-text search query where each word in the value is considered a search term
- 'operator' - defined operator values are:
  - 'AND' or 'OR' (default) logical operator for combining search terms
  - 'phrase' specifies the search term is an exact phrase

### Geo Query Operators

- 'contains' - the field contains the point or polygon
- 'within' - the field is within the polygon
- 'intersect' - the field intersects the polygon
- 'disjoint' - the field does not intersect the polygon

## Using Storage Patterns

- Storage patterns are used by the following:
  - StorageJunction.retrieve() method.
  - StorageReader based classes.
  - In [StorageETL](https://github.com/dictadata/storage-etl) tract definitions.

## Examples

### Query all constructs

To retrieve all rows do not provide a match expression.

```javascript
  let results = await junction.retrieve();
  // OR
  let results = await junction.retrieve({
    order: { 'Foo': 'asc' }
  });
```

### Query by field value

The following example retrieves the construct from the source where the field _Foo equals the value "first"_. This is a simplified version of _Query by field expression_ with _'eq'_ equals operator.

```javascript
let results = await junction.retrieve({
  match: {
    "Foo": "first"
  }
});
```

### Query multiple field values

In the simplified form the query value can be an array.  In this example constructs with _Foo equals "first" OR Foo equals "second"_ will be returned.

```javascript
let results = await junction.retrieve({
  match: {
    "Foo": [ "first", "second" ]
  }
})
```

### Query with multiple fields

In this example constructs with _Foo equals "first" AND Baz equals 100_ will be returned.

```javascript
let results = await junction.retrieve({
  match: {
    "Foo": "first",
    "Bar": 100
  }
})
```

### Query by field expression

The following example retrieves the record from the source where the field _Foo_ equals the value _"first"_.

```javascript
let results = await retrieve({
  match: {
    "Foo": { "eq": "first" }
  }
})
```

### Retrieve with range expression

This example returns all constructs where _"Baz is greater than 0 AND Baz is less than or equal to 1000_.

```javascript
let results = await junction.retrieve({
  match: {
    "Baz": { "gt": 0, "lte": 1000 }
  }
})
```

### Retrieve with cues

This examples uses pattern cues that are passed to the data source to filter and limit the results returned.

```javascript
let results = await junction.retrieve({
  match: {
    "rating": { "gte": 4.0 },
  },
  fields: [ "Foo", "Bar", "rating" ]
  order: { "rating": "desc" },
  count: 5,
})
```

### Retrieve with wildcard

The following query returns constructs where the field _Bar begins with 'row'_.

```javascript
let results = await junction.retrieve({
  match: {
    "Bar": { 'wc': 'row*' }
  }
})
```

### Retrieve full-text search

The following examples returns constructs where field _Bar contains the terms 'row' OR 'boat'_.

```javascript
let results = await junction.retrieve({
  match: {
    "Bar": { 'search': 'row boat' }
  }
})
```

### Retrieve full-text search AND

The following examples returns constructs where field _Bar contains the terms 'row' AND 'boat'_.

```javascript
let results = await junction.retrieve({
  match: {
    "Bar": {
      'search': 'row boat',
      'op': 'AND'
     }
  }
})
```

### Retrieve full-text search phrase

The following examples returns constructs where field _Bar contians the exact phrase 'row your boat'_.

```javascript
let results = await junction.retrieve({
  match: {
    "Bar": {
      'search': 'row your boat',
      'op': 'phrase'
    }
  },
})
```

### Retrieve full-text search multiple fields

The following examples returns constructs where fields _title, description OR tags contains the terms 'big' AND 'data'_. In this pattern the field name "_" is ignored, any value could be used.

```javascript
let results = await junction.retrieve({
  match: {
    "_": {
      'search': 'big data',
      'fields': [ "title", "description", "tags" ],
      "op": "AND"
    }
  }
})
```

### Retrieve with Geo coordinates

The following example returns constructs where fields _properties.LSAD equals "00" AND geometry contains point [ -73.985428, 40.748817 ]_.

Note, the values of a geo point array are [ longitude, latitude ] as specified in [GeoJSON](https://geojson.org) and [Well-Known Text](https://docs.opengeospatial.org/is/12-063r5/12-063r5.html).

```javascript
let results = await junction.retrieve({
  match: {
    "geometry": {
      "properties.LSAD": "00",
      "contains": [ -73.985428, 40.748817 ]
    }
  }
})
```
