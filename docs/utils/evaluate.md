# function evaluate

```javascript
  /**
   * Get value from field(s) and/or literal values
   * @param {object} construct - the object to pick values from
   * @param {String|Number|Boolean} expression in the form "=[prop.]fieldname+'literal'+..."
   */
  function evaluate(expression, construct)
```

```javascript
 expression
   literal
   =expression-value
   /=expression-value/[flags]

 literal
   string value, without inner ' delimiter characters

 expression-value
   field-name/regexp/replace/:padding
   exp-value
   exp-value + exp-value + ...

 exp-value
   field-name | 'string' | number | boolean [:padding]

 field-name
   name | dot-notation

 function
   func(field, arg1, arg2)

 field-name/regexp/replace/
   field-name a field that contains string values
   regexp regular expression
   replacement string using $n to insert capture groups
```

Notes:
  An expression-value of a single field name results in underlying type, e.g. string, number, boolean.
  Concatenation will result in a string if any exp-value results in a string.
  Concatenating boolean values will have unexpected results.
  Regular expressions can not contain + characters use {1,} instead.

## example expressions

```javascript
 "literal"
 19
 true
 "=_count"
 "=subObj2.subsub.izze"
 "=County+' County'"
 "=geometry.type+properties.FID"
 "=District Name/(\\d{3})/$1"
 "=STATE+'_'+LSAD+'_'+COUNTYFP+CDFP+SLDUST+SLDLST"

```
