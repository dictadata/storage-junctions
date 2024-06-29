# function match

```javascript
/**
 *
 * @param {object} match - match expression
 * @param {object} construct - object with fields to check
 */
function match(expression, construct)
```

## example match expression

```javascript
  // must match all criteria to return true
  {
    "field1": 'value',
    "field2": {
      gt: 100,
      lt: 200
    },
    "field3": ['value1','value2',...],
    "field4": /ab+c/i
  }
```

## operators

  'eq'     - field equal to value, same as "field1": 'value' criteria
  'neq'    - field not equal to value
  'lt'     - field less than value
  'lte'    - field less than or equal to value
  'gt'     - field greater than value
  'gte'    - field greater than or equal to value
  'wc'     - field matches a string value containing wildcard characters '?', '*'
  'in'     - field value is in given array
  'exists' - field exists in construct, value is ignored
