/**
 * mssql/queries
 */
"use strict";

const encoder = require('./encoder');
const sqlString = require('tsqlstring');
const types = require('../types');
const isoDates = require('../utils/isoDates');
const logger = require('../logger');

exports.connectionConfig = (options) => {

  var config = {
      server: options.server || 'localhost',
      authentication: {
        type: "default",
        options: {
          userName: options.userName || options.username || 'root',
          password: options.password || ''
        }
      },
      options: {
        encrypt: false,
        appName: options.appName || 'mssql-junction',
        database: options.database || '',
        useColumnNames: true,
        validateBulkLoadParameters: true
       // should look for other connection options
      },
  };
  
  return config;
}

function encodeValue(field, value) {
  switch (field.type) {
    case "date":
      if ((typeof value === "object") && (value instanceof Date))
        return sqlString.escape(value);
      else if (typeof value === "string" && types.isDate(value))
        return sqlString.escape(isoDates.parseDate(value));
      else
        return "NULL";
    case "boolean":
      return (value) ? 1 : 0;
    case "list":
    case "map":
      // stuff json representation in a column
      return sqlString.escape(JSON.stringify(value));
    case "binary":
      return "NULL";   // to do figure out how to pass buffers
    default:
      return sqlString.escape(value);
  }
}

exports.decodeResults = (engram, columns) => {
  logger.debug("mssql decodeResults");
  if (typeof columns !== "object") return {};

  let construct = {};
  for (let [name, colProps] of Object.entries(columns)) {
    let value = colProps.value;
    let field = engram.find(name);
    switch (field.type) {
      case "date":
        construct[name] = value;
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
        construct[name] = value;
    }
  }

  return construct;
};

exports.sqlDescribeTable = (tblname) => {
  let sql = `SELECT 
    sc.name 'name',
    st.Name 'type',
    sc.max_length 'size',
    sc.precision,
    sc.scale,
    sc.is_nullable,
	sm.text 'default',
    ISNULL(si.is_primary_key, 0) 'is_pkey'
FROM    
    sys.columns sc
INNER JOIN 
    sys.types st ON st.user_type_id = sc.user_type_id
LEFT JOIN
	sys.syscomments sm ON sm.id = sc.default_object_id
LEFT OUTER JOIN 
    sys.index_columns ic ON ic.object_id = sc.object_id AND ic.column_id = sc.column_id
LEFT OUTER JOIN 
    sys.indexes si ON ic.object_id = si.object_id AND ic.index_id = si.index_id
WHERE
    sc.object_id = OBJECT_ID('${tblname}')`;

  return sql;
}

exports.sqlCreateTable = (engram) => {
  let sql = "CREATE TABLE " + engram.smt.schema + " (";
  let primaryKeys = [];

  let first = true;

  for (let [name, field] of Object.entries(engram.fields)) {
    if (first)
      first = false;
    else
      sql += ",";

    sql += " " + sqlString.escapeId(name);
    sql += " " + encoder.mssqlType(field);

    if (field.isKey) {
      primaryKeys.push(sqlString.escapeId(name));
      field.isNullable = false;
    }

    if (field.isNullable)
      sql += " NULL";
    else
      sql += " NOT NULL";

    if (field.default)
      sql += " DEFAULT " + sqlString.escape(field.default);
  }

  if (primaryKeys.length > 0) {
    sql += ", PRIMARY KEY (" + primaryKeys.join(', ') + ")";
  }
  sql += ");";

  logger.verbose(sql);
  return sql;
};

exports.sqlInsert = (engram, construct) => {

  let names = Object.keys(construct);
  let values = Object.values(construct);

  let sql = "INSERT INTO " + engram.smt.schema + " (";
  let first = true;
  for (let name of names) {
    (first) ? first = false : sql += ",";
    sql += sqlString.escapeId(name);
  }
  sql += ") VALUES (";
  first = true;
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
      sql += sqlString.escapeId(name) + "=" + encodeValue(field, value);
    }
  }

  if (engram.keys.length > 0) {
    sql += " WHERE ";

    // key fields
    first = true;
    for (let i = 0; i < names.length; i++) {
      let name = names[i];
      let value = values[i];
      let field = engram.find(name);
      if (field.isKey) {
        (first) ? first = false : sql += " AND ";
        sql += sqlString.escapeId(name) + "=" + encodeValue(field, value);
      }
    }
  }

  logger.debug(sql);
  return sql;
};

/**
 * options: {fieldname: value, ...}
 */
exports.sqlWhereFromKey = (engram, pattern) => {
  let match = (pattern && pattern.match) || pattern || {};
  let sql = "";

  if (engram.keys.length > 0) {
    sql += " WHERE ";

    let first = true;
    for (let key of engram.keys) {
      let value = match[key];
      (first) ? first = false : sql += " AND ";
      sql += sqlString.escapeId(key) + "=" + encodeValue(engram.find(key), value);
    }
  }

  logger.debug(sql);
  return sql;
};

/**
 * filter patterns
 * select: { match: {field1: value} }
 * expression: { match: {field1: {"op": value}} }
 *
 * aggregate patterns:
 * function: { aggregate: {"newfield": {"func": "field1"}} }
 * group by: { aggregate: {"field1": {"newfield": {"func", "field2"}}} }
 */
exports.sqlSelectWithPattern = (engram, pattern) => {

  let sql = "SELECT ";
  if (pattern.count)
    sql += `TOP ${pattern.count} `;

  let columns = [];
  if (pattern.fields) {
    for (let f of pattern.fields)
      columns.push(sqlString.escapeId(f));
  }
  if (pattern.aggregate) {
    // find all the {"func": "field"} expressions
    for (let [name,exp] of Object.entries(pattern.aggregate)) {
      for (let [func,value] of Object.entries(exp)) {
        if (typeof value === "object") {
          // group by aggregation functions
          let groupby = name;
          columns.push(sqlString.escapeId(groupby));
          let newfld = func;
          for (let [func,fld] of Object.entries(value)) {
            let exp = aggFunction(func) + "(" + sqlString.escapeId(fld) + ")";
            columns.push(exp + " as " + sqlString.escapeId(newfld));
          }
        }
        else {
          // totals aggregation functions
          let newfld = name;
          let fld = value;
          let exp = aggFunction(func) + "(" + sqlString.escapeId(fld) + ")";
          columns.push(exp + " as " + sqlString.escapeId(newfld));
        }
      }
    }
  }
  if (columns.length === 0)
    sql += "*";
  else
    sql += columns.join(",");

  sql += " FROM " + engram.smt.schema;

  if (pattern && pattern.match) {
    sql += " WHERE ";

    let first = true;
    for (let [fldname,value] of Object.entries(pattern.match)) {
      if (typeof value === 'object') {
        // expression(s) { op: value, ...}
        for (let [op,val] of Object.entries(value)) {
          (first) ? first = false : sql += " AND ";

          sql += sqlString.escapeId(fldname);
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
        sql += sqlString.escapeId(fldname) + "=" + encodeValue(engram.find(fldname), value);
      }
    }
  }

  if (pattern.aggregate) {
    let f = true;
    // find group by fields of aggregate: {"group_by_field": {"func": "field"} }
    for (let [groupby,exp] of Object.entries(pattern.aggregate)) {
      for (let [fld,funcfld] of Object.entries(exp)) {
        if (typeof funcfld === "object") {
          // group by aggregation functions
          if (f) sql += " GROUP BY ";
          (f) ? f = false : sql += ",";
          sql += sqlString.escapeId(groupby);
        }
        // else not groupby
      }
    }
  }

  if (pattern.order) {
    sql += " ORDER BY ";
    let f = true;
    for (const [name, direction] of Object.entries(pattern.order)) {
      (f) ? f = false : sql += ",";
      sql += sqlString.escapeId(name) + " " + direction;
    }
  }

  logger.verbose(sql);
  return sql;
};

function aggFunction(cfunc) {
  switch (cfunc) {
    case 'sum': return 'SUM';
    case 'avg': return 'AVG';
    case 'min': return 'MIN';
    case 'max': return 'MAX';
    case 'count': return 'COUNT';
    default: return cfunc;
  }
}