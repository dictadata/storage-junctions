# Adjoin Transform


## adjoin transform definition

```javascript
  {
    transform: "adjoin",
    smt: "",
    options: {},
    pattern: {},
    lookup: {
      "lookup_field": "=construct_field|'literal'+..."
    }
    inject: "inject_field" | [ "inject_field", ... ]
  };
```

* lookup_table - contains rows retrieved from lookup_table data source
* lookup - is a match expression for the lookup_table
* lookup_field - fields(s) to match in the lookup_table
* construct_field - get values from the streaming constructs
* inject_field - field(s) from the found lookup row to inject into construct

## example adjoin transform

```javascript
{
  "transform": "adjoin",
  "lookup_table": {
    "smt": "census.gov:ansi_county",
    "pattern": {
      "STATE": "IA"
    }
  },
  "lookup": {
    "STATENAME": "=County+' County'"
  },
  "inject": [ "STATEFP" ]
}
```
