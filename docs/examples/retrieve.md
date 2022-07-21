# Storage Retrieval

## Pattern

```json
pattern: {
  "match": {
    "Foo": "first",
    "Bar": { "gte": 0, "lte": 1000 }
  },
  "fields": ["Foo","Bar","Baz"],
  "count": 3,
  "order": { "Bar": "desc" }
}
```
