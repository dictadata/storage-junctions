# aggregate transform

## example field (column summaries)

```javascript
  {
    transform: "aggregate",

    fields: {
      "Foo": {
        "aggField": { "sum": "Baz" },
        "count": { "count": "Baz" },
        "dt_min": { "min": "Dt Test" },   <---
        "dt_max": { "max": "Dt Test" }    <---
      }
    }
  }
```

## example aggregate transform

```javascript
  {
    transform: "aggregate",

    "fields": {
      "aggField1": {"sum": "field1},
      "field2": {"aggField2": { "sum": "field3" } }
    }
  };
```

* newField1 = summary total for field1
* newField2 = [] grouped on field2 and calculate sum of field3 for each unique value of field2
