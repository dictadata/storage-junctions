/**
 * elasticsearch/encoder
 */
"use strict";

const logger = require('../logger');

var excludeProperties = { "@timestamp": 0, "tags": 0, "_meta": 0 };

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
      case "float":
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
var storageField = exports.storageField = function (name,property) {

  let field = {
    name: property.name,
    type: storageType(property.type),
    size: 0,
    default: property.null_value || null,
    isNullable: true,
    isKey: false,
    // add additional elasticsearch fields
    _model_elasticsearch: property
  };

  return field;
};

/**
 *
 */
exports.mappingsToFields = function (mappings) {
  logger.debug('mappings getEncoding');

  let fields = {};

  // map mappings properties to encoding fields
  for (let [name, property] of Object.entries(mappings.properties)) {
    if (!(name in excludeProperties)) {
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
let fieldsToMappings = exports.fieldsToMappings = function(fields) {
  logger.debug('mappings putEncoding');

  let mappings = {
    properties: {}
  };

  // map encoding to mappings
  logger.debug("translate encoding");
  for (let [name, field] of Object.entries(fields)) {
    let ftype = field.type;

    if (ftype === "object") {
      mappings.properties[name] = fieldsToMappings(field.fields);
    }
    else if (ftype === "array") {
      // get type from subtype
      if (!field.field)
        throw new Error("invalid array field");

      let subfield = field.field;
      mappings.properties[name] = fieldsToMappings({sub: subfield});
    }
    else if (ftype !== "undefined") {
      mappings.properties[name] = { "type": elasticType(field) };

      if (field.default !== null && field.type !== 'text') {
        mappings.properties[name].null_value = field.default;
      }

      if (field._model_elasticsearch) {
        Object.assign(mappings.properties[name], field._model_elasticsearch);
      }
    }
  }

  return mappings;
};