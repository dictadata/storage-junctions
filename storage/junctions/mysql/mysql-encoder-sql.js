/**
 * mysql/queries
 */
"use strict";

const encoder = require('./mysql-encoder');
const { logger } = require('@dictadata/lib');
const { typeOf, isDate, parseDate } = require('@dictadata/lib');
const sqlString = require('sqlstring');
const fs = require('node:fs');

exports.connectionConfig = (smt, options) => {

  // parse database connection string
  // "host=address;user=name;password=secret;database=name;..."
  let conn = {};
  let pairs = smt.locus.split(';');
  for (let i = 0; i < pairs.length; i++) {
    let kv = pairs[ i ].split('=');
    if (!conn[ kv[ 0 ] ])
      conn[ kv[ 0 ].toLowerCase() ] = kv[ 1 ];
  }

  var config = {
    connectionLimit: options.connectionLimit || 8,
    host: conn.host || 'dev.dictadata.net',
    user: conn.user || (options.auth?.username) || 'root',
    password: conn.password || (options.auth?.password) || '',
    database: conn.database || '',
    charset: conn.charset || 'utf8mb4',
    timezone: conn.timezone || 'Z'
  };
  if (options.ssl || options.tls)
    config.ssl = options.ssl || options.tls;

  return config;
};

function encodeValue(field, value) {
  let dt;
  switch (field.type.toLowerCase()) {
    case "date":
      dt = value;
      if (typeof value === "string")
        dt = (isDate(value) === 1) ? parseDate(value) : new Date(dt);
      return dt ? sqlString.escape(dt) : "NULL";
    case "boolean":
      return (value) ? 1 : 0;
    case "list":
    case "map":
      // store as json string
      return sqlString.escape(JSON.stringify(value));
    case "binary":
      return "NULL";   // to do figure out how to pass buffers
    default:
      return sqlString.escape(value);
  }
}

exports.decodeResults = function (engram, construct) {
  logger.debug("mysql decodeResults");
  if (typeOf(construct) !== "object") return;

  for (let [ name, value ] of Object.entries(construct)) {
    let field = engram.find(name);
    let stype = field.type.toLowerCase();

    switch (stype) {
      case "date":
        if (typeof value === "string" && value.startsWith("0000"))
          construct[ name ] = null;
        break;
      case "boolean":
        construct[ name ] = (value) ? true : false;
        break;
      case "list":
      case "map":
        if (typeof value === "string")
          // stored as json string
          construct[ name ] = JSON.parse(value);
        else
          construct[ name ] = value;
        break;
      case "binary":
        break;   // to do figure out how to pass buffers
      case "number":
        if (typeof value === "string")
          construct[ name ] = parseFloat(value);
        else
          construct[ name ] = value;
        break;
      case "integer":
        if (typeof value === "string")
          construct[ name ] = parseInt(value);
        else
          construct[ name ] = value;
        break;
      default:
      // retrieved value should be good
    }
  }
};

exports.decodeIndexResults = (engram, columns) => {
  for (let column of columns) {
    if (column[ "Key_name" ] === "PRIMARY") {
      // primary key's index
      let field = engram.find(column[ "Column_name" ]);
      field.key = column[ "Seq_in_index" ];
    }
    else {
      // other index
      if (!Object.hasOwn(engram, "indices")) engram.indices = {};
      if (!Object.hasOwn(engram.indices, column[ "Key_name" ])) engram.indices[ column[ "Key_name" ] ] = { fields: [] };
      let index = engram.indices[ column[ "Key_name" ] ];
      index.unique = !column[ "Non_unique" ];
      index.fields[ column[ "Seq_in_index" ] - 1 ] = {
        "name": column[ "Column_name" ],
        "order": column[ "Collation" ] === 'D' ? "DESC" : "ASC"
      };
    }
  }
};

exports.sqlCreateTable = function (engram, options) {
  let sql = "CREATE TABLE " + engram.smt.schema + " (";
  let primaryKeys = [];

  let first = true;
  for (let field of engram.fields) {
    (first) ? first = false : sql += ',';

    sql += " " + sqlString.escapeId(field.name);
    sql += " " + encoder.mysqlType(field);

    if (field.isKey) {
      primaryKeys[ field.key - 1 ] = sqlString.escapeId(field.name);
      field.nullable = false;
    }

    if (field.isNullable)
      sql += " NULL";
    else
      sql += " NOT NULL";

    if (field.hasDefault && (field.default !== null || field.isNullable))
      sql += " DEFAULT " + sqlString.escape(field.default);
  }

  if (primaryKeys.length > 0) {
    sql += ", PRIMARY KEY (" + primaryKeys.join(', ') + ")";
  }

  // other indexes
  if (!options.bulkLoad && engram.indices) {
    for (let [ name, index ] of Object.entries(engram.indices)) {
      sql += ",";
      if (index.unique) sql += " UNIQUE ";
      sql += "INDEX " + sqlString.escapeId(name) + "(";
      let first = true;
      for (let col of index.fields) {
        (first) ? first = false : sql += ",";
        sql += sqlString.escapeId(col.name);
        if (col.order) sql += " " + col.order;
      }
      sql += ")";
    }
  }

  sql += ");";
  return sql;
};

exports.sqlInsert = function (engram, construct) {

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
    let name = names[ i ];
    let value = values[ i ];
    let field = engram.find(name);
    (first) ? first = false : sql += ",";
    sql += encodeValue(field, value);
  }
  sql += ")";

  logger.debug(sql);
  return sql;
};

exports.sqlUpdate = function (engram, construct) {

  let names = Object.keys(construct);
  let values = Object.values(construct);

  let sql = "UPDATE " + engram.smt.schema + " SET";
  let first = true;
  for (let i = 0; i < names.length; i++) {
    let name = names[ i ];
    if (!engram.keys.includes(name)) {
      let field = engram.find(name);
      let value = values[ i ];
      (first) ? first = false : sql += ",";
      sql += sqlString.escapeId(name) + "=" + encodeValue(field, value);
    }
  }

  logger.debug(sql);
  return sql;
};

exports.sqlInsertUpdate = function (engram, construct) {

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
    let name = names[ i ];
    let value = values[ i ];
    let field = engram.find(name);
    (first) ? first = false : sql += ",";
    sql += encodeValue(field, value);
  }
  sql += ")";

  if (engram.keys.length > 0 && engram.keys.length < engram.fieldsLength) {
    sql += " ON DUPLICATE KEY UPDATE";

    first = true;
    for (let i = 0; i < names.length; i++) {
      let name = names[ i ];
      if (!engram.keys.includes(name)) {
        let field = engram.find(name);
        let value = values[ i ];
        (first) ? first = false : sql += ",";
        sql += sqlString.escapeId(name) + "=" + encodeValue(field, value);
      }
    }
  }

  logger.debug(sql);
  return sql;
};

exports.sqlBulkInsert = function (engram, constructs) {

  // all constructs MUST have the same fields
  let names = Object.keys(constructs[ 0 ]);

  let sql = "INSERT INTO " + engram.smt.schema + " (";
  let first = true;
  for (let name of names) {
    (first) ? first = false : sql += ",";
    sql += sqlString.escapeId(name);
  }
  sql += ") VALUES ";

  first = true;
  for (let construct of constructs) {
    (first) ? first = false : sql += ",";
    sql += "(";

    let vfirst = true;
    for (let i = 0; i < names.length; i++) {
      let name = names[ i ];
      let value = construct[ name ];
      let field = engram.find(name);
      (vfirst) ? vfirst = false : sql += ",";
      sql += encodeValue(field, value);
    }
    sql += ")";
  }

  logger.debug(sql);
  return sql;
};

/**
 * options: {fieldname: value, ...}
 */
exports.sqlWhereByKey = (engram, pattern) => {
  const match = (pattern?.match) || pattern || {};
  let sql = "";

  if (engram.keys.length > 0) {
    sql += " WHERE ";

    let first = true;
    for (let fldname of engram.keys) {
      let value = match[ fldname ];
      let tvalue = typeOf(value);

      if (tvalue === "undefined")
        throw "key value undefined " + fldname;
      else if (tvalue === 'object') {
        // expression(s) { op: value, ...}
        for (let [ op, val ] of Object.entries(value)) {
          (first) ? first = false : sql += " AND ";

          sql += sqlString.escapeId(fldname);
          switch (op.toLowerCase()) {
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
      else if (tvalue === 'array') {
        // multiple values { field: [ value1, value2, ... ] }
        (first) ? first = false : sql += " AND ";
        sql += "(";
        let f1rst = true;
        for (let val of value) {
          (f1rst) ? f1rst = false : sql += " OR ";
          sql += sqlString.escapeId(fldname) + "=" + encodeValue(engram.find(fldname), val);
        }
        sql += ")";
      }
      else {
        // single value { field: value }
        (first) ? first = false : sql += " AND ";
        sql += sqlString.escapeId(fldname) + "=" + encodeValue(engram.find(fldname), value);
      }
    }
  }

  logger.debug(sql);
  return sql;
};

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
exports.sqlSelectByPattern = function (engram, pattern) {

  let sql = "SELECT ";
  let columns = [];

  // OUTPUT COLUMNS
  if (pattern?.fields) {
    for (let f of pattern.fields)
      columns.push(sqlString.escapeId(f));
  }
  else if (pattern?.aggregate) {
    // find all the {"func": "field"} expressions
    for (let [ name, exp ] of Object.entries(pattern.aggregate)) {
      for (let [ func, value ] of Object.entries(exp)) {
        if (typeOf(value) === "object") {
          // the field to GROUPBY
          let groupby = sqlString.escapeId(name);
          if (!columns.includes(groupby))
            columns.push(groupby);

          // aggregate columns for GROUP BY
          let asfld = func;
          for (let [ func, fld ] of Object.entries(value)) {
            let sfunc = sqlFunction(func);
            let exp = sfunc + "(" + sqlString.escapeId(fld) + ")";
            columns.push(exp + " as " + sqlString.escapeId(asfld));

            addField(sfunc, engram, fld, asfld);
          }
        }
        else {
          // aggregate columns for summary
          let asfld = name;
          let fld = value;
          let sfunc = sqlFunction(func);
          let exp = sfunc + "(" + sqlString.escapeId(fld) + ")";
          columns.push(exp + " as " + sqlString.escapeId(asfld));

          addField(sfunc, engram, fld, asfld);
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
  if (pattern?.match && Object.keys(pattern.match).length > 0) {
    sql += " WHERE ";

    let first = true;
    for (let [ fldname, value ] of Object.entries(pattern.match)) {
      let tvalue = typeOf(value);

      if (tvalue === 'object') {
        // expression(s) { op: value, ...}
        for (let [ op, val ] of Object.entries(value)) {
          (first) ? first = false : sql += " AND ";

          sql += sqlString.escapeId(fldname);
          switch (op.toLowerCase()) {
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
      else if (tvalue === 'array') {
        // multiple values { field: [ value1, value2, ... ] }
        (first) ? first = false : sql += " AND ";
        sql += "(";
        let f1rst = true;
        for (let val of value) {
          (f1rst) ? f1rst = false : sql += " OR ";
          sql += sqlString.escapeId(fldname) + "=" + encodeValue(engram.find(fldname), val);
        }
        sql += ")";
      }
      else {
        // single value { field: value }
        (first) ? first = false : sql += " AND ";
        sql += sqlString.escapeId(fldname) + "=" + encodeValue(engram.find(fldname), value);
      }
    }
  }

  // GROUP BY clause
  if (pattern?.aggregate) {
    let f = true;
    // find group by fields of aggregate: {"group_by_field": {"func": "field"} }
    for (let [ groupby, exp ] of Object.entries(pattern.aggregate)) {
      for (let [ fld, funcfld ] of Object.entries(exp)) {
        if (typeOf(funcfld) === "object") {
          // group by field
          if (f) sql += " GROUP BY ";
          (f) ? f = false : sql += ",";
          sql += sqlString.escapeId(groupby);
        }
        // else not groupby
        break;
      }
      // should only be one aggregate.property for group by
    }
  }

  // ORDER BY clause
  if (pattern?.order) {
    sql += " ORDER BY ";
    let f = true;
    for (const [ name, direction ] of Object.entries(pattern.order)) {
      (f) ? f = false : sql += ",";
      sql += sqlString.escapeId(name) + " " + direction;
    }
  }

  // LIMIT clause
  if (pattern?.LIMIT || pattern?.count)
    sql += " LIMIT " + (pattern.LIMIT || pattern.count);
  if (pattern?.OFFSET)
    sql += " OFFSET " + pattern.OFFSET;

  return sql;
};

function sqlFunction(cfunc, stype) {
  switch (cfunc.toLowerCase()) {
    case 'sum': return 'SUM';
    case 'avg': return 'AVG';
    case 'min': return 'MIN';
    case 'max': return 'MAX';
    case 'count': return 'COUNT';
    default: return cfunc;
  }
}

function addField(sfunc, engram, fld, asfld) {
  // add aggregate field to definitions
  let aggFld = engram.find(fld);
  aggFld.name = asfld;
  if (sfunc === "AVG")
    aggFld.type = "number";
  if (sfunc === "COUNT")
    aggFld.type = "integer";
  engram.add(aggFld);
}
