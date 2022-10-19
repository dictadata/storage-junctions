## Transforms

```json
// example transform with filter and field mapping
{
  "transform": {
    "filter": {
      "match": {
        "Bar": "row",
        "Baz": { "gt": 100 }
      },
      "drop": {
        "Baz": 5678
      }
    },
    "mutate": {
      "default": {
        "Fie": "where's fum?"
      },
      "map": {
        "Foo": "Foo",
        "Bar": "Bar",
        "Baz": "Bazzy"
      },
      "remove": [ "Fobe" ],
      "override": {
        "Fie": "override the fum"
      }
    }
  }
}
```
### FilterTransform

```json
  // example filter transform

  transform: {
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

### MutateTransform

```json
  // example fields transform

  transform: {
    "mutate": {
      // inject new fields or set defaults in case of missing values
      "default": {
        "newField": <value>
        "existingField": <default value>
      },

      // select a list of fields
      "select": ["field1", "field2", ... ],

      // or map fields using dot notation
      // { src: dest, ...}
      "map": {
        "field1": "Field1",
        "object1.subfield":  "FlatField"
      },

      // remove fields from the new construct
      "remove": ["field1", "field2"],

      // inject new fields or override existing values
      "override": {
        "newField": <value>,
        "existingField": <override value>
      }

    }
  };
```

### order of operations

* default
* select | map
* assign
* remove
* override

### AggregateTransform

Summarize and/or aggregate a stream of objects.  Functionality similar to SQL GROUP BY and aggregate functions like SUM or Elasticsearch's _search aggregations.

```json
  // example aggregate Summary transform
  // summary totals for field1
  // format "newField: { "function": "field name" }
  {
    "transform": {
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
    "transform": {
      "aggregate": {
        "field1": {
          "subTotal": { "sum": "field2" } },
          "count": { "count": "field2" } }
      }
    }
  }
```
