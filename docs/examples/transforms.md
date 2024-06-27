## Transforms

```json
// example transform with filter and field mapping
{
  "transforms": [
    {
      "transform": "filter",
      "match": {
        "Bar": "row",
        "Baz": { "gt": 100 }
      },
      "drop": {
        "Baz": 5678
      }
    },
    {
      "transform": "mutate",
      "default": {
        "Fie": "where's fum?"
      },
      "map": {
        "Foo": "Foo",
        "Bar": "Bar",
        "Baz": "Bazzy"
      },
      "assign": {
        "Fie": "override the fum"
      },
      "remove": [ "Fobe" ]
    }
  ]
}
```
### FilterTransform

```json
  // example filter transform

  {
    "transform": "filter",
    // match all expressions to forward
    "match": {
      "field1": "value",
      "field2": {"gt": 100, "lt": 200}
    },
    // match all expressions to drop
    "drop": {
      "field1": "value",
      "field2": { "lt": 0 }
    }
  };
```

### MutateTransform

```json
  // example fields transform

  {
    "transform": "mutate",

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

    // inject new fields or override existing values
    "assign": {
      "newField": <value>,
      "existingField": <override value>
    },

    // remove fields from the new construct
    "remove": ["field1", "field2"]

  };
```

### order of mutate operations

* default
* select | map | (all)
* list
* func
* assign
* remove

### AggregateTransform

Summarize and/or aggregate a stream of objects.  Functionality similar to SQL GROUP BY and aggregate functions like SUM or Elasticsearch's _search aggregations.

```json
  // example aggregate field summary
  {
    "transforms": [
      {
        "transform": "aggregate",
        "fields": [
          {
            "totals": "totals",
            "count": "=count(myField)",
            "sum": "=sum(myField)",
            "min": "=min(myField)",
            "max": "=max(myField)",
            "avg": "=avg(myField)",
            "var": "=var(myField)",
            "stdev": "=stdev(myField)"
          }
        ]
      }
    ]
  }

  // example aggregate with Group By and Summary
  {
    "transforms": [
      {
        "transform": "aggregate",
        "fields": [
          {
            "_groupby": "myField1",
            "count": "=count(myField2)",
            "sum": "=sum(myField2)",
            "avg": "=avg(myField2)"
          },
          {
            "myField1": "totals",
            "count": "=count(myField2)",
            "sum": "=sum(myField2)",
            "min": "=min(myField2)",
          }
        ]
      }
    ]
  }
```
