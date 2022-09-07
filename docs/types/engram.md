# Engram

> : unit of cognitive information imprinted in a physical substance, theorized to be the means by which memories are stored : [Wikipedia](https://en.wikipedia.org/wiki/Engram_%28neuropsychology%29)

Engram objects represent the location and encoding of a specific data source.

An Engram is an encoding for a storage memory trace.  It
contains the field information needed to encode and decode constructs for storage.

## Class: Engram

### new Engram(SMT|encoding)

* SMT <SMT|string> SMT object or SMT string.
* encoding <Engram|encoding> Engram object or Javascript object that must have an *SMT* property.  The encoding object may optionally have *fields* array property and Codex related properties.

### engram.add(field)

* field is a Field object containing the field's encoding definition.

Adds a field to the fields property. If the field exists in the fields property then it is replace with the new field value.

### engram.dull()

Resets the fields property to a empty object {}. Note, smt and other properties remain unchanged.

### engram.encoding &lt;encoding&gt;

Accesor property where the getter function returns a plain Javascript object containing the following properties:

* name &lt;string&gt;
* type &lt;string&gt;
* description &lt;string&gt;
* tags [&lt;string&gt;, ...]
* smt &lt;SMT&gt;
* fields [&lt;Field&gt;, ...]
* 

The setter function accepts an encoding parameter of Engram or plain Javascript object containing a fields array or fields object.

### engram.find(name)

* name &lt;string&gt;

Find a field object in the fields.

### engram.merge(encoding)

* encoding &lt;encoding&gt; an Engram object or plain Javascript object containing an *fields* property.

Merges new field encodings into the existing fields property.

### engram.toString()

Returns the SMT string representation.

### Engram._copy(dst, src)

* dst &lt;encoding&gt;
* src &lt;encoding&gt;

Copy all src properties to dst object. Deep copy of object properties.  Shallow copy of reference types like array, Date, etc. Does not copy functions. Note, recursive function.

### Engram._convert(fieldMap)

### engram.smt &lt;SMT&gt;

SMT object.

### engram.name &lt;string&gt;

default is smt.schema.  The engram.name is used by a Codex as the unique key.  If an engram is to be stored in a Codex the name must be unique.  Consider using a dot notation to name engram encodings, e.g. *"myCompany.myGroup.datasource_1"*.

### engram.type &lt;string&gt;

Possible values  "engram", "tract".  Default value is "engram".

### engram.description &lt;string&gt;

A short human readable description for the engram.

### engram.tags [&lt;string&gt;, ...]

An array of keyword strings that can be used to retreive a set of engrams from a Codex.

### engram.fields [&lt;Field&gt;, ...]

The fields encoding array.

### engram.fieldsMap &lt;Object&gt;

### engram.caseInsensitive &lt;boolean&gt;

Default value is *false*;

### engram.encoding &lt;encoding&gt;

getter

* Returns an object with engram properties, but without any functions.

setter

* Replace fields definitions where encoding parameter is an engram, encoding or fields object.

### engram.isDefined &lt;boolean&gt;

Returns true if at least one field encoding is defined.

### engram.fieldsLength &lt;integer&gt;

### engram.names [&lt;string&gt;, ...]

Returns array of field names.

### engram.keyof &lt;string&gt;

Accessor property with the getter function returning the type of key specified in smt.key that determines how to access the storage source.  Possible values:

* "primary" - smt.key is a string that defines the key fields "=field[, ...]" used for structured database lookups.
* "key" - smt.key is a string that defines the key fields "!field[, ...]" used for key|value data store lookups.
* "uid" - smt.key is a single value that contains a unique value to use as default. If they key is a uid then the data source effectively references one construct (record).
* "all" - smt.key is a wildcard character '*'. Denotes that the primary key(s) are specified in field encodings. If there are no fields specified as key then using the recall method is not possible.
* "none" - smt.key is not defined

Setter function is undefined.

### engram.keys [&lt;string&gt;, ...]

Accessor property where getter function returns an array of fields names from smt.key or from field definitions.

Setter function is undefined.

### engram.uid &lt;string|number&gt;

Acessor property where the getter function returns an UID value if the smt points to an individual piece of data, i.e. smt.key is a unique value. Otherwise, null is returned.

Setter function is undefined.

### get_uid(construct) {

* construct &lt;Object&gt;

Returns a unique ID value for the construct (record) by concatenating the values from key fields.
