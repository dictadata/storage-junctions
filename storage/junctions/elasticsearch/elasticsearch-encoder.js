/**
 * elasticsearch/encoder
 */
"use strict";

const { Engram, StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');
const { typeOf } = require('@dictadata/lib');

var excludeProperties = [ "@timestamp", "_meta" ];

/**
 * convert a elastic type to a storage type
 */
var storageType = exports.storageType = function (elasticType) {

  // convert to storage type
  let fldType = 'unknown';
  switch (elasticType.toLowerCase()) {
    case 'integer':
    case 'long':
    case 'short':
    case 'byte':
      fldType = 'integer';
      break;

    case 'double':
    case 'float':
    case 'half_float':
    case 'scaled_float':
      fldType = 'number';
      break;

    case 'boolean':
      fldType = 'boolean';
      break;

    case 'date':
      fldType = 'date';
      break;

    case 'text':
      fldType = 'text';
      break;

    case 'keyword':
      fldType = 'keyword';
      break;

    case 'binary':
      fldType = 'binary';
      break;

    case 'geo_shape':
      // GeoJSON geometry object
      // coordinates member can actually be nested arrays
      fldType = 'map';
      break;

    case 'nested':
      // won't get here, have not implemented nested objects
      // need to use codify transform to identify arrays
      fldType = 'list';
      break;
  }

  return fldType;
};

/**
 * return a elastic type from a storage field definition
 */
var elasticType = exports.elasticType = function (field) {
  let elasticType = "text";

  if (field.elastic_type) {
    elasticType = field.elastic_type;
  }
  else {
    switch (field.type.toLowerCase()) {
      case "boolean":
        elasticType = "boolean";
        break;
      case "integer":
        elasticType = "integer";
        break;
      case "number":
        elasticType = "double";
        break;
      case "keyword":
        elasticType = "keyword";
        break;
      case "string":
      case "text":
        elasticType = "text";
        break;
      case "date":
        elasticType = "date";
        break;
      case "binary":
        elasticType = "binary";
        break;
      case "geometry":
        elasticType = "geo_shape";
        break;
    }
  }

  return elasticType;
};

/**
 * convert a elastic mappings properties definition to a storage field definition
 */
var storageField = exports.storageField = function (name, property) {

  let field = {
    name: property.name || name,
    type: storageType(property.type),
    //size: 0,
    //nullable: true,
    //key: 0,
    // add additional elasticsearch fields
  };

  if (Object.hasOwn(property, "null_value"))  // default if value is null
    field.default = property[ "null_value" ];

  // add elasticsearch definition
  field._elasticsearch = property;
  return field;
};

/**
 *
 */
exports.propertiesToFields = function propertiesToFields(properties) {
  logger.debug('propertiesToFields');

  let fields = [];

  // map mappings properties to encoding fields
  for (let [ name, property ] of Object.entries(properties)) {
    if (excludeProperties.includes(name))
      continue;

    // check for Elasticsearch object  fields
    if (Object.hasOwn(property, "properties")) {
      if (property.type === "nested") {
        // won't get here, nested not implemented
        // need to use codify tranform to identify arrays
        fields.push({
          "name": name,
          "type": "list",
          "_list": storageField(name, property)
        });
      }
      else {
        // property.type "object", the elasticsearch default
        fields.push({
          "name": name,
          "type": "map",
          "fields": propertiesToFields(property.properties)
        });
      }
    }
    else {
      fields.push(storageField(name, property));
    }
  }

  //logger.debug(JSON.stringify(fields));
  return fields;
};

/**
 *
 * @param {*} encoding
 */
exports.fieldsToProperties = function fieldsToProperties(fields) {
  logger.debug('fieldsToProperties');

  if (typeOf(fields) === "object") {
    fields = Engram._convert(fields);
  }

  let properties = {};

  // map encoding to properties

  for (let field of fields) {
    let ftype = field.type;

    if (field._elasticsearch) {
      properties[ field.name ] = field._elasticsearch;
    }
    else if (ftype === "map") {
      if (!field.fields)
        throw new StorageError(400, "invalid map, fields not defined");
      properties[ field.name ] = { properties: fieldsToProperties(field.fields) };
    }
    else if (ftype === "list") {
      if (!field._list)
        throw new StorageError(400, "invalid list, _list not defined");
      // elasticsearch/lucene supports arrays for all basic types
      let properties = fieldsToProperties([ field._list ]);
      properties[ field.name ] = { properties: properties._list };
    }
    else if (ftype !== "unknown") {
      properties[ field.name ] = { "type": elasticType(field) };

      if (field.hasDefault && field.type !== 'text') {
        properties[ field.name ].null_value = field.default;
      }
    }
  }

  return properties;
};
