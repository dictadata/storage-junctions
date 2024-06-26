# Aggregate Transform

Sample aggregate transforms with internal structures

## Sample Dataset

```csv
"category","item","quantity","cost"
"tools","widget_1",10,1.00
"tools","widget_1",10,1.00
"tools","widget_2",10,1.00
"tools","widget_2",10,1.00
"supplies","whatsit_1",20,0.50
"supplies","whatsit_1",20,0.50
"supplies","whatsit_2",20,0.50
"supplies","whatsit_2",20,0.50
```


## Aggregate Fields Summary

Aggregate summary values (totals) for the dataset.

`__summary` denotes the summary fields, i.e. not a a group by field name.

```javascript
  {
    transform: "aggregate",
    fields: {
      "__summary": {
        "totals": "totals",
        "count": "=count(item)",
        "qty": "=sum(quantity)",
        "value": "=sum(quantity*cost)"
      }
    }
  }
```

### output

```json
[
  {
    "totals": "totals",
    "count": 8,
    "qty": 120,
    "value": 80.00
  }
]
```

### internal structure

```javascript
this.accumulators = {
  "__summary": {
    "totals": "totals",
    "count": Accumulator,
    "qty": Accumulator,
    "value": Accumulator
  }
}
```


## Aggregate with Group By and Summary

Group by `category` field and aggregate values. Aggregate summary values for the dataset.

```javascript
  {
    transform: "aggregate",
    fields: {
      "category": {
        "count": "=count()",
        "qty": "=sum(quantity)",
        "value": "=sum(quantity*cost)"
      },
      "__summary": {
        "category": "totals",
        "count": "=count(item)",
        "qty": "=sum(quantity)",
        "value": "=sum(quantity*cost)"
      }
    }
  }
```

### output

```json
[
  {
    "category": "tools",
    "count": 4,
    "qty": 40,
    "value": 40.00
  },
  {
    "category": "supplies",
    "count": 4,
    "qty": 80,
    "value": 40.00
  },
  {
    "category": "totals",
    "count": 8,
    "qty": 120,
    "value": 80.00
  }
]
```

### internal structure

```javascript
this.accumulators = {
  "category": {
    __accumulators: {
      "tools": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      },
      "supplies": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      }
    }
  },
  "__summary": {
    "category": "totals",
    "count": Accumulator,
    "qty": Accumulator,
    "value": Accumulator
  }
}
```


## Aggregate with Nested Group By

```javascript
  {
    transform: "aggregate",
    fields: {
      "category": {
        "item": {
          "count": "=count()",
          "qty": "=sum(quantity)",
          "value": "=sum(quantity*cost)"
        }
      }
    }
  };
```
### output

```json
[
  {
    "category": "tools",
    "item": "widget_1",
    "count": 2,
    "qty": 20,
    "value": 20.00
  },
  {
    "category": "tools",
    "item": "widget_2",
    "count": 2,
    "qty": 20,
    "value": 20.00
  },
  {
    "category": "supplies",
    "item": "whatsit_1",
    "count": 2,
    "qty": 40,
    "value": 20.00
  },
  {
    "category": "supplies",
    "item": "whatsit_2",
    "count": 2,
    "qty": 40,
    "value": 20.00
  }
]
```

### internal structure

```javascript
this.accumulators = {
  "category": {
    __accumulators: {
      "tools": {
        "item": {
          __accumulators: {
            "widget_1": {
              "count": Accumulator,
              "qty": Accumulator,
              "value": Accumulator
            },
            "widget_2": {
              "count": Accumulator,
              "qty": Accumulator,
              "value": Accumulator
            }
          }
        }
      },
      "supplies": {
        "item": {
          __accumulators: {
            "whatsit_1": {
              "count": Accumulator,
              "qty": Accumulator,
              "value": Accumulator
            },
            "whatsit_2": {
              "count": Accumulator,
              "qty": Accumulator,
              "value": Accumulator
            }
          }
        }
      }
    }
  }
}
```


## Aggregate with Multiple Group By and Summary

```javascript
  {
    transform: "aggregate",
    fields: {
      "category": {
        "count": "=count()",
        "qty": "=sum(quantity)",
        "value": "=sum(quantity*cost)"
      },
      "item": {
        "count": "=count()",
        "qty": "=sum(quantity)",
        "value": "=sum(quantity*cost)"
      },
      "__summary": {
        "totals": "totals",
        "count": "=count(item)",
        "qty": "=sum(quantity)",
        "value": "=sum(quantity*cost)"
      }
    }
  };
```
### output

```json
[
  {
    "category": "tools",
    "count": 4,
    "qty": 40,
    "value": 40.00
  },
  {
    "category": "supplies",
    "count": 4,
    "qty": 80,
    "value": 40.00
  }
  {
    "item": "widget_1",
    "count": 2,
    "qty": 20,
    "value": 20.00
  },
  {
    "item": "widget_2",
    "count": 2,
    "qty": 20,
    "value": 20.00
  },
  {
    "item": "whatsit_1",
    "count": 2,
    "qty": 40,
    "value": 20.00
  },
  {
    "item": "whatsit_2",
    "count": 2,
    "qty": 40,
    "value": 20.00
  },
  {
    "totals": "totals",
    "count": 8,
    "qty": 120,
    "value": 80.00
  }
]
```

### internal structure

```javascript
this.accumulators = {
  "category": {
    __accumulators: {
      "tools": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      },
      "supplies": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      }
    }
  },
  "item": {
    __accumulators: {
      "widget_1": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      },
      "widget_2": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      },
      "whatsit_1": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      },
      "whatsit_2": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      }
    }
  },
  "__summary": {
    "totals": "totals",
    "count": Accumulator,
    "qty": Accumulator,
    "value": Accumulator
  }
}
```
