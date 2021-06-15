/**
 * oracledb/queries
 */
"use strict";

const encoder = require('./oracledb-encoder');
const { typeOf, hasOwnProperty, isDate, parseDate, getCI, logger } = require('../../utils');

//var _reservedWords = ["ACCESS", "ELSE", "MODIFY", "START", "ADD", "EXCLUSIVE", "NOAUDIT", "SELECT", "ALL", "EXISTS", "NOCOMPRESS", "SESSION", "ALTER", "FILE", "NOT", "SET", "AND", "FLOAT", "NOTFOUND", "SHARE", "ANY", "FOR", "NOWAIT", "SIZE", "ARRAYLEN", "FROM", "NULL", "SMALLINT", "AS", "GRANT", "NUMBER", "SQLBUF", "ASC", "GROUP", "OF", "SUCCESSFUL", "AUDIT", "HAVING", "OFFLINE", "SYNONYM", "BETWEEN", "IDENTIFIED", "ON", "SYSDATE", "BY", "IMMEDIATE", "ONLINE", "TABLE", "CHAR", "IN", "OPTION", "THEN", "CHECK", "INCREMENT", "OR", "TO", "CLUSTER", "INDEX", "ORDER", "TRIGGER", "COLUMN", "INITIAL", "PCTFREE", "UID", "COMMENT", "INSERT", "PRIOR", "UNION", "COMPRESS", "INTEGER", "PRIVILEGES", "UNIQUE", "CONNECT", "INTERSECT", "PUBLIC", "UPDATE", "CREATE", "INTO", "RAW", "USER", "CURRENT", "IS", "RENAME", "VALIDATE", "DATE", "LEVEL", "RESOURCE", "VALUES", "DECIMAL", "LIKE", "REVOKE", "VARCHAR", "DEFAULT", "LOCK", "ROW", "VARCHAR2", "DELETE", "LONG", "ROWID", "VIEW", "DESC", "MAXEXTENTS", "ROWLABEL", "WHENEVER", "DISTINCT", "MINUS", "ROWNUM", "WHERE", "DROP", "MODE", "ROWS", "WITH"];

function escapeId(name) {
  /*
  // check that characters are alphanumeric or _ # $
  let rx = new RegExp(/^[0-9A-Za-z_#\$]+$/);
  if (!rx.test(name) || _reservedWords.includes(name.toUpperCase()))
    // quoted identifier
    return '"' + name + '"';
  else
    // unquoted identifier
    return name;
  */
  
  let cname = name.replace(/"/g, '""');
  return '"' + cname + '"';
}

function escapeString(value) {
  if (typeof value === "string") {
    value = value.replace(/'/g, "''");
    return "'" + value + "'";
  }
  else if (typeof value === "undefined") {
    return "NULL";
  }
  else
    return value;
}

function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

function formatSQLDate(date, withMS = false) {
  let df = "YYYY-MM-DD HH24:MI:SS";
  let ds = date.getUTCFullYear() +
    '-' + pad(date.getUTCMonth() + 1) +
    '-' + pad(date.getUTCDate()) +
    ' ' + pad(date.getUTCHours()) +
    ':' + pad(date.getUTCMinutes()) +
    ':' + pad(date.getUTCSeconds());
  if (withMS) {
    df += ".FF3"
    ds += '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5)
  }
  return "TO_DATE('" + ds + "','" + df + "')"
};
    
function encodeValue(field, value) {
  switch (field.type) {
    case "date":
      let dt = value;
      if (typeof value === "string")
        dt = (isDate(value) === 1) ? parseDate(value) : new Date(dt);
      return dt ? formatSQLDate(dt) : "NULL";
    case "boolean":
      return (value) ? 1 : 0;
    case "list":
    case "map":
      // stuff json representation in a column
      return escapeString(JSON.stringify(value));
    case "binary":
      return "NULL";   // to do figure out how to pass buffers
    default:
      return escapeString(value);
  }
}

exports.decodeResults = (engram, construct) => {
  logger.debug("oracledb decodeResults");
  if (typeOf(construct) !== "object") return;

  for (let [name, value] of Object.entries(construct)) {
    let field = engram.find(name);
    switch (field.type) {
      case "date":
        break;
      case "boolean":
        construct[name] = (value) ? true : false;
        break;
      case "list":
      case "map":
        // unstuff the stored json representation
        construct[name] = JSON.parse(value);
        break;
      case "binary":
        break;   // to do figure out how to pass buffers      
      default:
         // retrieved value should be good
    }
  }

};

exports.sqlListTables = () => {
  return "SELECT table_name FROM user_tables";
}

exports.sqlDescribeTable = (schema) => {
  //return `SELECT * FROM ${schema.toUpperCase()} FETCH FIRST 1 ROW ONLY`;
  return `select column_id, column_name, data_type, data_length, data_precision, data_scale, nullable, char_length 
from user_tab_columns 
where table_name = '${schema.toUpperCase()}' 
order by column_id`;
};

exports.sqlDescribeIndexes = (schema) => {
  return `SELECT ui.index_name, ui.index_type, ui.uniqueness, ucon.constraint_type, ui.status, uic.column_name, uic.column_position, uic.descend, uie.column_expression 
  FROM user_indexes ui 
  JOIN user_ind_columns uic ON uic.index_name = ui.index_name 
  LEFT JOIN user_constraints ucon ON ucon.index_name = ui.index_name 
  LEFT JOIN user_ind_expressions uie ON uie.index_name = ui.index_name AND uie.column_position = uic.column_position 
  WHERE ui.table_name = '${schema.toUpperCase()}' 
  ORDER BY ui.index_name, uic.column_position`;
};

exports.decodeIndexResults = (engram, results) => {
  for (let column of results.rows) {
    if (column["CONSTRAINT_TYPE"] === "P") {
      // primary key index
      let field = engram.find(column["COLUMN_NAME"]);
      field["key"] = column["COLUMN_POSITION"];
    }
    else {
      // other index
      if (!hasOwnProperty(engram, "indices")) engram.indices = {};
      if (!hasOwnProperty(engram.indices, column["INDEX_NAME"])) engram.indices[column["INDEX_NAME"]] = {fields: []};
      let index = engram.indices[column["INDEX_NAME"]];
      index.unique = (column["UNIQUENESS"] === "UNIQUE");
      let name;
      if (column["COLUMN_EXPRESSION"]) {
        name = column["COLUMN_EXPRESSION"];  // a quoted column name, hopefully not an expression
        name = name.substr(1, name.length - 2);  // trim quotes
      }
      index.fields[column["COLUMN_POSITION"] - 1] = {
        "name": name ? name : column["COLUMN_NAME"],
        "order": column["DESCEND"]
      }
    }
  }
}

exports.sqlActivate = (schema) => {
  return "ALTER TABLE " + schema + " NOLOGGING";
};

exports.sqlRelax = (schema) => {
  return "ALTER TABLE " + schema + " LOGGING";
};

exports.sqlCreateTable = (engram, options) => {
  let sql = "CREATE TABLE " + engram.smt.schema + " (";
  let primaryKeys = [];

  let first = true;
  for (let [name, field] of Object.entries(engram.fields)) {
    (first) ? first = false : sql += ',';
    sql += " " + escapeId(name);
    sql += " " + encoder.sqlType(field);

    if (field.isKey) {
      primaryKeys[field.key-1] = escapeId(name);
      field.isNullable = false;
    }
    if (field.isNullable)
      sql += " NULL";
    else
      sql += " NOT NULL";
    if (field.defaultValue)
      sql += " DEFAULT " + escapeString(field.defaultValue);
  }

  if (primaryKeys.length > 0) {
    sql += ", PRIMARY KEY (" + primaryKeys.join(', ') + ")";
  }
  
  sql += ")";
  return sql;
};

exports.sqlCreateIndex = (engram, indexName) => {
  let index = (engram.indices && engram.indices[indexName]) ? engram.indices[indexName] : "";
  if (!index) return "";
    
  let sql = "CREATE ";
  if (index.unique) sql += "UNIQUE ";
  sql += "INDEX " + escapeId(indexName);
  sql += " ON " + engram.smt.schema + " (";

  let first = true;
  for (let field of index.fields) {
    (first) ? first = false : sql += ',';
    sql += " " + escapeId(field.name);
    if (field.order) sql += " " + field.order;
  }

  sql += ")";
  return sql;
};

exports.sqlDropTable = (schema) => {
  return "DROP TABLE " + schema;
}

exports.sqlInsert = (engram, construct) => {

  let names = Object.keys(construct);
  let values = Object.values(construct);

  let sql = "INSERT INTO " + engram.smt.schema + " (";
  let first = true;
  for (let name of names) {
    (first) ? first = false : sql += ",";
    sql += escapeId(name);
  }
  sql += ") VALUES (";
  first = true;
  /* TBD parameterized statements
  for (let name of names) {
    (first) ? first = false : sql += ",";
    sql += ":" + escapeId(name);
  }
  */
  for (let i = 0; i < names.length; i++) {
    let name = names[i];
    let value = values[i];
    let field = engram.find(name);
    (first) ? first = false : sql += ",";
    sql += encodeValue(field,value);
  }
  sql += ")";

  logger.debug(sql);
  return sql;
};

exports.sqlBulkInsert = function (engram, constructs) {

  // all constructs MUST have the same fields
  let names = Object.keys(constructs[0]);

  let sql = "INSERT /*+ append */ ALL ";
  for (let construct of constructs) {
  
    sql += "INTO " + engram.smt.schema + " (";
    let first = true;
    for (let name of names) {
      (first) ? first = false : sql += ",";
      sql += escapeId(name);
    }
    sql += ") VALUES (";
    let vfirst = true;
    for (let name of names) {
      let value = construct[name];
      let field = engram.find(name);
      (vfirst) ? vfirst = false : sql += ",";
      sql += encodeValue(field, value);
    }
    sql += ") ";
  }
  sql += "SELECT 1 FROM DUAL";

  logger.debug(sql);
  return sql;
};

exports.sqlUpdate = (engram, construct) => {

  let names = Object.keys(construct);
  let values = Object.values(construct);

  let sql = "UPDATE " + engram.smt.schema + " SET ";

  // non-key fields
  let first = true;
  for (let i = 0; i < names.length; i++) {
    let name = names[i];
    let value = values[i];
    let field = engram.find(name);
    if (!field.isKey) {
      (first) ? first = false : sql += ", ";
      sql += escapeId(name) + "=" + encodeValue(field, value);
    }
  }

  if (engram.keys.length > 0) {
    sql += " WHERE ";

    // key fields
    first = true;
    for (let name of engram.keys) {
      let field = engram.find(name);
      let value = construct[name];
      if (typeof value === "undefined")
        throw "key value undefined " + name;
      (first) ? first = false : sql += " AND ";
      sql += escapeId(name) + "=" + encodeValue(field, value);
    }
  }

  logger.debug(sql);
  return sql;
};

exports.sqlSelectByKey = (engram, pattern) => {
  return "SELECT * FROM " + engram.smt.schema + sqlWhereByKey(engram, pattern)
}

exports.sqlDeleteByKey = (engram, pattern) => {
  return "DELETE FROM " + engram.smt.schema + sqlWhereByKey(engram, pattern);
}

exports.sqlDeleteByPattern = (engram, pattern) => {
  return "DELETE FROM " + engram.smt.schema + sqlWhereByPattern(engram, pattern);
}

exports.sqlTruncateTable = (schema) => {
  return "TRUNCATE TABLE " + schema;
}

/**
 * Pattern for aggregation
 * 
 * filter constructs:
 *   match: {<field>: value, ...}
 *   match: {<field>: {"op": value, ...}}
 * choose fields:
 *   fields: [<field>, ...]
 * OR
 * aggregate summary:
 *   aggregate: {"<as name>": {"func": "field"}}
 * aggregate groupby
 *   aggregate: {"<groupby field>": {"<as name>": {"func", "field"}}}
 */
exports.sqlSelectByPattern = (engram, pattern) => {

  let sql = "SELECT ";

  // OUTPUT COLUMNS
  let columns = [];
  if (pattern.fields) {
    for (let f of pattern.fields)
      columns.push(escapeId(f));
  }
  else if (pattern.aggregate) {
    // find all the {"func": "field"} expressions
    for (let [name,exp] of Object.entries(pattern.aggregate)) {
      for (let [func,value] of Object.entries(exp)) {
        if (typeOf(value) === "object") {
          // the field to group by
          let groupby = escapeId(name);
          if (!columns.includes(groupby))
            columns.push(groupby);
          // aggregate columns for GROUP BY
          let asfld = func;
          for (let [func,fld] of Object.entries(value)) {
            let exp = sqlFunction(func) + "(" + escapeId(fld) + ")";
            columns.push(exp + " as " + escapeId(asfld));
          }
        }
        else {
          // totals aggregation functions
          let asfld = name;
          let fld = value;
          let exp = sqlFunction(func) + "(" + escapeId(fld) + ")";
          columns.push(exp + " as " + escapeId(asfld));
        }
      }
    }
  }
  if (columns.length === 0)
    sql += "*";
  else
    sql += columns.join(",");

  // FROM clause
  sql += " FROM " + engram.smt.schema;

  // WHERE clause
  if (pattern && pattern.match) {
    sql += this.sqlWhereByPattern(engram, pattern);
  }

  // GROUP BY clause
  if (pattern.aggregate) {
    let f = true;
    // find group by fields of aggregate: {"group_by_field": {"func": "field"} }
    for (let [groupby,exp] of Object.entries(pattern.aggregate)) {
      for (let [fld,funcfld] of Object.entries(exp)) {
        if (typeOf(funcfld) === "object") {
          // group by field
          if (f) sql += " GROUP BY ";
          (f) ? f = false : sql += ",";
          sql += escapeId(groupby);
        }
        // else not groupby
        break;
      }
      // should only be one aggregate.property for group by
    }
  }

  // ORDER BY clause
  if (pattern.order) {
    sql += " ORDER BY ";
    let f = true;
    for (const [name, direction] of Object.entries(pattern.order)) {
      (f) ? f = false : sql += ",";
      sql += escapeId(name) + " " + direction;
    }
  }

  // LIMIT clause
  if (pattern.count)
    sql += ` FETCH FIRST ${pattern.count} ROWS ONLY`;
  
  return sql;
};

/**
 * options: {fieldname: value, ...}
 */
let sqlWhereByKey = exports.sqlWhereByKey = (engram, pattern) => {
  const match = (pattern && pattern.match) || pattern || {};
  let sql = "";

  if (engram.keys.length > 0) {
    sql += " WHERE ";

    let first = true;
    for (let key of engram.keys) {
      let value = getCI(match, key);
      if (typeof value === "undefined")
        throw "key value undefined " + key;
      (first) ? first = false : sql += " AND ";
      sql += escapeId(key) + "=" + encodeValue(engram.find(key), value);
    }
  }

  logger.debug(sql);
  return sql;
};

/**
 * options: {fieldname: value, ...}
 */
let sqlWhereByPattern = exports.sqlWhereByPattern = (engram, pattern) => {
  const match = (pattern && pattern.match) || pattern || {};
  let sql = " WHERE ";

  let first = true;
  for (let [fldname, value] of Object.entries(match)) {
    if (typeOf(value) === 'object') {
      // expression(s) { op: value, ...}
      for (let [op, val] of Object.entries(value)) {
        (first) ? first = false : sql += " AND ";

        sql += escapeId(fldname);
        switch (op) {
          case 'gt': sql += " > "; break;
          case 'gte': sql += " >= "; break;
          case 'lt': sql += " < "; break;
          case 'lte': sql += " <= "; break;
          case 'eq': sql += " = "; break;
          case 'neq': sql += " != "; break;
          case 'wc': sql += " LIKE ";
            val = val.replace(/\*/g, "%").replace(/\?/g, "_");
            break;
          default: sql += " ??? ";
        }
        sql += encodeValue(engram.find(fldname), val);
      }
    }
    else {
      // single property { field: value }
      (first) ? first = false : sql += " AND ";
      sql += escapeId(fldname) + "=" + encodeValue(engram.find(fldname), value);
    }
  }
  
  logger.debug(sql);
  return sql;
};

function sqlFunction(cfunc) {
  switch (cfunc) {
    case 'sum': return 'SUM';
    case 'avg': return 'AVG';
    case 'min': return 'MIN';
    case 'max': return 'MAX';
    case 'count': return 'COUNT';
    default: return cfunc;
  }
}
