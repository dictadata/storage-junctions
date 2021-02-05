/**
 * elasticsearch/encoder
 */
"use strict";

const logger = require('../logger');

var excludeProperties = [ "@timestamp", "_meta" ];

/**
 * convert a elastic type to a storage type
 */
var storageType = exports.storageType = function (elasticType) {

  // convert to storage type
  let fldType = 'undefined';
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
      case "text":
        elasticType = "text";
        break;
      case "date":
        elasticType = "date";
        break;
      case "binary":
        elasticType = "binary";
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
    size: 0,
    default: property.null_value || null,
    isNullable: true,
    keyOrdinal: 0,
    // add additional elasticsearch fields
    _elasticsearch: property
  };

  return field;
};

/**
 *
 */
exports.mappingsToFields = function mappingsToFields(mappings) {
  logger.debug('mappings getEncoding');

  let fields = {};

  // map mappings properties to encoding fields
  for (let [name, property] of Object.entries(mappings.properties)) {
    if (excludeProperties.includes(name))
      continue;

    // check for Elasticsearch object  fields
    if (property.properties) {
      if (property.type && property.type === "nested") {
        // won't get here, nested not implemented
        // need to use codify tranform to identify arrays
        fields[name] = {
          "name": name,
          "type": "list",
          "_item": storageField(name, property)
        };
      }
      else {
        // property.type "object", the elasticsearch default
        fields[name] = {
          "name": name,
          "type": "map",
          "fields": mappingsToFields(property)
        };
      }
    }
    else {
      fields[name] = storageField(name, property);
    }
  }

  logger.debug(JSON.stringify(fields));
  return fields;
};

/**
 *
 * @param {*} encoding
 */
exports.fieldsToMappings = function fieldsToMappings(fields) {
  logger.debug('mappings putEncoding');

  let mappings = {
    properties: {}
  };

  // map encoding to mappings
  logger.debug("translate encoding");
  for (let [name, field] of Object.entries(fields)) {
    let ftype = field.type;

    if (ftype === "map") {
      if (!field.fields)
        throw new Error("invalid map, fields not defined");
      mappings.properties[name] = fieldsToMappings(field.fields);
    }
    else if (ftype === "list") {
      if (!field._item)
        throw new Error("invalid list, _item not defined");
      // elasticsearch/lucene supports arrays for all basic types
      let mapping = fieldsToMappings({ "_item": field._item });
      mappings.properties[name] = mapping.properties._item;
    }
    else if (ftype !== "undefined") {
      mappings.properties[name] = { "type": elasticType(field) };

      if (Object.prototype.hasOwnProperty.call(field, "default") && field.type !== 'text') {
        mappings.properties[name].null_value = field.default;
      }

      if (field._elasticsearch) {
        Object.assign(mappings.properties[name], field._elasticsearch);
      }
    }
  }

  return mappings;
};
