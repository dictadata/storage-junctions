/**
 * postgresql/encoder
 */
"use strict"

const ynBoolean = require('yn');

/**
 * convert a postgresql type to a storage type
 * returns an array with [storageType,size]
 */
var storageType = exports.storageType = function (postgresqlType) {
  let mst = '';
  let sz = '';

  // format is usually "name(size)" e.g. "int(11)"
  let found = false;
  for (let i = 0; i < postgresqlType.length; i++) {
    if (postgresqlType[i] === '(')
      found = true;
    else if (postgresqlType[i] === ')')
      break;
    else if (!found)
      mst += postgresqlType[i];
    else
      sz += postgresqlType[i];
  }

  let size = parseInt(sz);

  // convert to storage type
  let fldType = 'undefined';
  switch (mst.toUpperCase()) {
    case 'TINYINT':
    case 'SMALLINT':
    case 'INT':
    case 'MEDIUMINT':
    case 'YEAR':
      fldType = 'integer';
      break;

    case 'FLOAT':
    case 'DOUBLE':
      fldType = 'float';
      break;

    case 'TIMESTAMP':
    case 'DATE':
    case 'DATETIME':
      fldType = 'date';
      break;

    case 'CHAR':
    case 'VARCHAR':
    case 'TINYTEXT':
    case 'MEDIUMTEXT':
    case 'LONGTEXT':
    case 'TEXT':
    case 'DECIMAL':  // odd balls
    case 'BIGINT':
    case 'TIME':
    case 'GEOMETRY':
      fldType = 'text';
      break;

    case 'ENUM':
    case 'SET':
      fldType = 'keyword';
      break;

    case 'TINYBLOB':
    case 'MEDIUMBLOB':
    case 'LONGBLOB':
    case 'BLOB':
    case 'BINARY':
    case 'VARBINARY':
    case 'BIT':
      fldType = 'binary';
      break;
  }

  return [fldType, size];
}

/**
 * convert a postgresql column definition to a storage field definition
 */
var storageField = exports.storageField = function (column) {

  let [fldType,size] = storageType(column.Type);

  let field = {
    name: column.Field,
    type: fldType,
    size: size,
    default: column.Default || null,
    isNullable: ynBoolean(column.Null) || false,
    isKey: column.Key || false,
    // add additional PostgreSQL fields
    postgresql_Type: column.Type,
    postgresql_Extra: column.Extra
  };

  return field;
};

/**
 * return a postgresql type from a storage field definition
 */
var postgresqlType = exports.postgresqlType = function (field) {
  let postgresqlType = "VARCHAR(32)";

  if (field.postgresql_type) {
    postgresqlType = field.postgresql_type;
  }
  else {
    switch (field.type) {
      case "boolean":
        postgresqlType ="TINYINT";
        break;
      case "integer":
        postgresqlType ="INT";
        break;
      case "float":
        postgresqlType ="DOUBLE";
        break;
      case "keyword":
        postgresqlType ="VARCHAR(" + (field.size || 64) + ")";
        break;
      case "text":
        postgresqlType ="VARCHAR(" + (field.size || 512) + ")";
        break;
      case "date":
        postgresqlType ="DATETIME";
        break;
      case "binary":
        postgresqlType ="BLOB";
        break;
    }
  }

  return postgresqlType;
};


exports.sqlCreateTable = function (engram) {
  let sql = "CREATE TABLE " + engram.schema + " (";

  let first = true;

  for (let [name, field] of Object.entries(engram.fields)) {
    if (first)
      first = false;
    else
      sql += ",";

    sql += "`" + name + "` ";
    sql += postgresqlType(field);
    if (field.isNullable)
      sql += " NULL";
    if (field.default)
      sql += " " + field.default;  // should check field type and add quotes if necessary
    if (field.isKey)
      sql += " KEY";
  }

  sql += ");";

  return sql;
};

exports.sqlInsert = function (engram, construct) {

  let names = Object.keys(construct);
  let values = Object.values(construct);

  let sql = "INSERT INTO " + engram.schema + " (";
  let first = true;
  for (let name of names) {
    if (first)
      first = false;
    else
      sql += ",";
    sql += "`" + name + "`";
  }

  sql += ") VALUES (";
  first = true;
  for (let i = 0; i < names.length; i++) {
    let name = names[i];
    let value = values[i];
    let field = engram.fields[name];

    if (first)
      first = false;
    else
      sql += ",";

    switch(field.type) {
      case "boolean":
        sql += value ? 1 : 0;
        break;
      case "integer":
        sql += value;
        break;
      case "float":
        sql += value;
        break;
      case "keyword":
        sql += "'" + value + "'";
        break;
      case "text":
        sql += "'" + value + "'";
        break;
      case "date":
        // eslint-disable-next-line no-case-declarations
        let ds = '';
        if ((typeof value === "object") && (value instanceof Date))
          ds = value.toISOString();
        else if (typeof value === "string")
          ds = value;  // assume ISO or other date string

        if (ds) {
          ds = ds.replace('T', ' ').replace('Z', '');
          sql += "'" + ds + "'";
        }
        else
          sql += "NULL";
        break;
      case "binary":
        sql += "";   // to do figure out how to pass buffers
        break;
    }
  }
  sql += ");";

  return sql;
};

function formatValue (field,value) {
  // check if value needs to be quoted
  let types = ['text', 'keyword', 'date'];
  if (types.includes(field.type))
    value = "'" + value + "'";

  return value;
}

/**
 * options: {fieldname: value, ...}
 */
exports.sqlWhereFromKey = function (engram, options) {

  let sql = "";

  if (engram.keys.length > 0) {
    sql += " WHERE";

    let first = true;
    for (let key of engram.keys) {
      let value = options[key];

      (first) ? first = false : sql += " AND";

      sql += " `" + key + "`=" + formatValue(engram.fields[key], value);
    }
  }

  return sql;
};

/**
 * pattern: { filter: {fieldname: value, ...}}
 */
exports.sqlSelectWithPattern = function (engram, pattern) {

  let sql = "SELECT";
  if (pattern.cues && pattern.cues.fields)
    sql += " " + pattern.cues.fields.join(",");
  else
    sql += " *";
  sql += " FROM " + engram.schema;

  if (pattern && pattern.filter) {
    sql += " WHERE";

    let first = true;
    for (let name in pattern.filter) {
      let value = pattern.filter[name];

      if (typeof value === 'object') {
        for ( let [op,val] of Object.entries(value) ) {
          (first) ? first = false : sql += " AND";

          sql += " `" + name + "`";
          switch (op) {
            case 'gt': sql += " > "; break;
            case 'gte': sql += " >= "; break;
            case 'lt': sql += " < "; break;
            case 'lte': sql += " <= "; break;
            case 'eq': sql += " = "; break;
            case 'neq': sql += " != "; break;
            default: sql += " ??? ";
          }
          sql += formatValue(engram.fields[name], val);
        }
      }
      else {
        (first) ? first = false : sql += " AND";
        sql += " `" + name + "` = " + formatValue(engram.fields[name], value);
      }
    }
  }

  if (pattern.cues && pattern.cues.order) {
    sql += " ORDER BY ";
    let f = true;
    for (const [name, direction] of Object.entries(pattern.cues.order)) {
      (f) ? f = false : sql += ",";
      sql += "`" + name + "` " + direction;
    }
  }

  if (pattern.cues && pattern.cues.count)
    sql += " LIMIT " + pattern.cues.count;

  return sql;
};
