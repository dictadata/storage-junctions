# filter transform


### example filter transform
```javascript
  {
    name: "my filter",
    transform: "filter",

    // match all expressions to forward
    match: {
      "field1": 'value',
      "field2": {
        gt: 100,
        lt: 200
      },
      "field3": ['value1','value2',...],
      "field4": /ab+c/i
    },

    // match all expressions to drop
    drop: {
      "field1": 'value',
      "field2": {
        lte: 0
      },
      'field3": [1,2,3],
      'field4": /ab+c/i
      }
    }
  };

```
