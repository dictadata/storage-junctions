# mutate transform

Select, inject and remove fields.
Map field names with ability to flatten or expand construct structure.
Default, assign and override field values.

```javascript

// order of operations:
//   default
//   select | map | (all fields)
//   list
//   func
//   assign
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
    select: ["field-name", ...]

    // map fields
    map: {
      "new-field-name": <value>,
      ...
    },

    // list, create array from fields and/or constants
    list: {
      "new-field_name": <value>,
      "new-field_name": [ <value>, ... ],
      ...
    }

    // modify field value with a function body
    func: {
      "field-name": "function body",
      ...
    }
    // where "function body" = "[statements...]; return some-value;"
    //
    // function call definition
    //   (construct, newConstruct) => { return some-value; }

    // assign field values, override values or inject new fields at end of object
    assign: {
      "field-name": <value>,
      ...
    }

    // remove fields from the new construct
    remove: ["field-name", ...]

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
