# aggregate transform

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

## aggregate fields summary

Aggregate summary values for the dataset.

`__` denotes the summary fields. Any characters after `__` are used as the field value. In this case there is no aggregate field

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

### Output

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

```csv
"totals","count","qty","value"
"totals",8,120,80.00
```

## aggregate with group by and fields summary

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


### Output

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

```csv
"category","count","qty","value"
"tools",4,40,40.00
"supplies",4,80,40.00
"totals",8,120,80.00
```

## example aggregate with nested group by

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
### Output

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

```csv
"category","item","count","qty","value"
"tools","widget_1",2,20,20.00
"tools","widget_2",2,20,20.00
"supplies","whatsit_1",2,40,20.00
"supplies","whatsit2_",2,40,20.00
```

## example aggregate with multiple group by

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
        "category": "totals",
        "count": "=count(item)",
        "qty": "=sum(quantity)",
        "value": "=sum(quantity*cost)"
      }
    }
  };
```
### Output

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
    "category": "totals",
    "count": 8,
    "qty": 120,
    "value": 80.00
  }
]
```

```csv
"category","item","count","qty","value"
"tools",,4,40,40.00
"supplies",,4,80,40.00
"","widget_1",2,20,20.00
"","widget_2",2,20,20.00
"","whatsit_1",2,40,20.00
"","whatsit2_",2,40,20.00
"totals",,8,120,80.00
```
