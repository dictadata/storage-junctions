/**
 * elasticsearch/default_mappings
 */
"use strict";

module.exports = {
  "settings": {
    "index": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "mapping.total_fields.limit": 1000,
      "mapping.depth.limit": 10,
      "mapping.nested_fields.limit": 10
    }
  },
  "mappings": {
    "_meta": {
      "version": "1.0.0"
    },
    "date_detection": false,
    "dynamic_templates": [
      {
        "strings_as_keyword": {
          "mapping": {
            "type": "keyword",
            "ignore_above": 1024
          },
          "match_mapping_type": "string"
        }
      }
    ],
    "properties": {
      "@timestamp": {
        "type": "date"
      },
      "tags": {
        "type": "keyword",
        "ignore_above": 1024
      },
      "_meta": {
        "properties": {}
      }
    }
  }
};
