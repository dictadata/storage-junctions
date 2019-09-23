/**
 * elasticsearch/default_template
 */
"use strict";

module.exports = {
  "index_patterns": [
    "prefix-*"
  ],
  "version": 1,
  "order": 1,
  "settings": {
    "index.mapping.total_fields.limit": 10000
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
