# mutate transform

Select, inject and remove fields.
Map field names with ability to flatten or expand construct structure.
Default, assign and override field values.

```javascript

// order of operations:
//   default
//   select | map | (all fields)
//   assign
//   override
//   remove

// example mutate transform
/*
  {
    transform: "mutate",

    // set default values or inject new fields first
    default: {
      "field-name": <value>,
      ...
    },

    // select fields
    select: ['field-name', 'field-name', ...]

    // map fields
    map: {
      <new-field-name>: <value>,
      ...
    },

    // modify field value with a function body
    // (construct) => { return some-value; }
    assign: {
      "field-name": "function body",
      ...
    }

    // override field values or inject new fields last
    override: {
      "field-name": <value>,
      ...
    }

    // remove fields from the new construct
    remove: ["field-name", "field-name", ...]

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
