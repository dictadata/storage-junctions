# mutate transform

Select, inject and remove fields.
Map field names with ability to flatten or expand construct structure.
Default, assign and override field values.

```javascript

// order of operations:
//   default
//   select
//   map
//   assign
//   remove
//   override

// example mutate transform
/*
  {
    transform: "mutate",

    // set default values or inject new fields
    default: {
      "field-name": <value>,
      "new-field-name": <value>
    },

    // select fields
    select: ['field-name', 'field-name', ...],

    // map fields
    map: {
      "field-name": <new-field-name>,
      "object-name.field-name":  <new-field-name>
    },

    // modify field value with a function body
    // function is passed (value, construct) arguments
    assign: {
      "field-name": <value>,
      "field-name": "function body; return newValue"
    }

    // remove fields from the new construct
    remove: ["field-name", "field-name"],

    // override field values or inject new fields
    override: {
      "field-name": <value>,
      "new-field-name": <value>
    }

  };
*/

// value
//   literal
//   =value-expression
//
// value-expression (with string concatenation)
//   exp-value
//   exp-value + exp-value + ...
//
// exp-value
//   field-name | 'literal string'
```
