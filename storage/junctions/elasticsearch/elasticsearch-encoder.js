/**
 * elasticsearch/encoder
 */
"use strict";

const { Engram, StorageError } = require("../../types");
const { hasOwnProperty, typeOf, logger } = require("../../utils");

var excludeProperties = [ "@timestamp", "_meta" ];

/**
 * convert a elastic type to a storage type
 */
var storageType = exports.storageType = function (elasticType) {

  // convert to storage type
  let fldType = 'unknown';
  switch (elasticType) {
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
      fldType = 'float';
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
      // need to use codify transfrom to identify arrays
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
    switch (field.type) {
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
 * convert a elastic mappings.properties definition to a storage field definition
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

  if (hasOwnProperty(property, "null_value"))  // default if value is null
    field.defaultValue = property[ "null_value" ];

  // add elasticsearch definition
  field._elasticsearch = property;
  return field;
};

/**
 *
 */
exports.mappingsToFields = function mappingsToFields(mappings) {
  logger.debug('mappingsToFields');

  let fields = [];

  // map mappings properties to encoding fields
  for (let [ name, property ] of Object.entries(mappings.properties)) {
    if (excludeProperties.includes(name))
      continue;

    // check for Elasticsearch object  fields
    if (hasOwnProperty(property, "properties")) {
      if (property.type && property.type === "nested") {
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
          "fields": mappingsToFields(property)
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
exports.fieldsToMappings = function fieldsToMappings(fields) {
  logger.debug('fieldsToMappings');

  if (typeOf(fields) === "object") {
    fields = Engram.convert(fields);
  }

  let mappings = {
    properties: {}
  };

  // map encoding to mappings
  logger.debug("translate encoding");
  for (let field of fields) {
    let ftype = field.type;

    if (ftype === "map") {
      if (!field.fields)
        throw new StorageError(400, "invalid map, fields not defined");
      mappings.properties[ field.name ] = fieldsToMappings(field.fields);
    }
    else if (ftype === "list") {
      if (!field._list)
        throw new StorageError(400, "invalid list, _list not defined");
      // elasticsearch/lucene supports arrays for all basic types
      let mapping = fieldsToMappings([ field._list ]);
      mappings.properties[ field.name ] = mapping.properties._list;
    }
    else if (ftype !== "unknown") {
      mappings.properties[ field.name ] = { "type": elasticType(field) };

      if (hasOwnProperty(field, "default") && field.type !== 'text') {
        mappings.properties[ field.name ].null_value = field.defaultValue;
      }

      if (field._elasticsearch) {
        Object.assign(mappings.properties[ field.name ], field._elasticsearch);
      }
    }
  }

  return mappings;
};
