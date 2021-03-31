/**
 * mssql/queries
 */
"use strict";

const encoder = require('./storage-encoder');
const { StorageError } = require('.');
const { typeOf, hasOwnProperty, isDate, parseDate } = require('../utils');
const logger = require('../logger');

module.exports = exports = class StorageSQLEncoder {

  constructor(options) {
    this.options = options;
  }
  
  escapeId(name) {
    return name;
  }

  escapeValue(value) {
    return value;
  }

  encodeValue(field, value) {
    switch (field.type) {
      case "date":
        let dt = value;
        if (typeof value === "string")
          dt = (isDate(value) === 1) ? parseDate(value) : new Date(dt);
        return dt ? this.escapeValue(dt) : "NULL";
      case "boolean":
        return (value) ? 1 : 0;
      case "list":
      case "map":
        // stuff json representation in a column
        return this.escapeValue(JSON.stringify(value));
      case "binary":
        return "NULL";   // to do figure out how to pass buffers
      default:
        return this.escapeValue(value);
    }
  }

  decodeResults(engram, columns) {
    logger.debug("mssql decodeResults");
    if (typeOf(columns) !== "object") return {};

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
  }

  decodeIndexResults(engram, column) {
    let index_name = column["index_name"].value;
    if (hasOwnProperty(column, "is_primary_key") && column["is_primary_key"].value) {
      // primary key index
      let field = engram.find(column["column_name"].value);
      field.keyOrdinal = column["key_ordinal"].value;
    }
    else {
      // other index
      if (!hasOwnProperty(engram, "indices")) engram.indices = {};
      if (!hasOwnProperty(engram.indices, index_name)) engram.indices[index_name] = { fields: [] };
      let index = engram.indices[index_name];
      index.unique = column["is_unique"].value;
      index.fields[column["key_ordinal"].value - 1] = {
        "name": column["column_name"].value,
        "order": column["is_descending_key"].value ? "DESC" : "ASC"
      }
    }
  }

  sqlDescribeTable(tblname) {
    let sql = `SELECT sc.name 'name', st.Name 'type', sc.max_length 'size', sc.precision, sc.scale, sc.is_nullable, sm.text 'default'
FROM sys.columns sc
JOIN sys.types st ON st.user_type_id = sc.user_type_id
LEFT JOIN sys.syscomments sm ON sm.id = sc.default_object_id
WHERE sc.object_id = OBJECT_ID('${tblname}')`;
    return sql;
  }

  sqlDescribeIndexes(tblname) {
    let sql = `SELECT si.name as 'index_name', si.is_unique, si.is_primary_key, ic.key_ordinal, ic.is_descending_key, sc.name as 'column_name'
FROM sys.indexes si 
JOIN sys.index_columns ic ON ic.object_id = si.object_id AND ic.index_id = si.index_id
JOIN sys.columns sc ON sc.object_id = si.object_id AND sc.column_id = ic.column_id
WHERE si.object_id = OBJECT_ID('${tblname}')`;
    return sql;
  }

  sqlCreateTable(engram, options) {
    let sql = "CREATE TABLE " + engram.smt.schema + " (";
    let primaryKeys = [];

    let first = true;
    for (let [name, field] of Object.entries(engram.fields)) {
      (first) ? first = false : sql += ",";
      sql += " " + this.escapeId(name);
      sql += " " + encoder.mssqlType(field);

      if (field.isKey) {
        primaryKeys[field.keyOrdinal - 1] = this.escapeId(name);
        field.isNullable = false;
      }
      if (field.isNullable)
        sql += " NULL";
      else
        sql += " NOT NULL";
      if (field.default)
        sql += " DEFAULT " + this.escapeValue(field.default);
    }

    if (primaryKeys.length > 0) {
      sql += ", PRIMARY KEY (" + primaryKeys.join(', ') + ")";
    }

    // other indices
    if (!options.bulkLoad && engram.indices) {
      for (let [name, index] of Object.entries(engram.indices)) {
        sql += ", INDEX " + this.escapeId(name);
        if (index.unique) sql += " UNIQUE ";
        sql += "("
        let cfirst = true;
        for (let col of index.fields) {
          (cfirst) ? cfirst = false : sql += ",";
          sql += this.escapeId(col.name);
          if (col.order) sql += " " + col.order;
        }
        sql += ")";
      }
    }

    sql += ");";
    return sql;
  }

  sqlAddIndices(engram, options) {
    if (!engram.indices)
      throw new StorageError(400, "No indices defined");
  
    let sql = "ALTER TABLE " + engram.smt.schema + " (";

    // non-primary indices
    let ifirst = true;
    for (let [name, index] of Object.entries(engram.indices)) {
      (ifirst) ? ifirst = false : sql += ",";
      sql += "ADD INDEX " + this.escapeId(name);
      if (index.unique) sql += "UNIQUE ";

      sql += "("
      let cfirst = true;
      for (let col of index.fields) {
        (cfirst) ? cfirst = false : sql += ",";
        sql += escapeId(col.name);
        if (col.order) sql += " " + col.order;
      }
      sql += ")";
    }

    sql += ");";
    return sql;
  }

  sqlDropIndices(engram, options) {
    if (!engram.indices)
      throw new StorageError(400, "No indices defined");
  
    let sql = "ALTER TABLE " + engram.smt.schema + " (";

    // non-primary indices
    let ifirst = true;
    for (let indexName of Object.keys(engram.indices)) {
      (ifirst) ? ifirst = false : sql += ",";
      sql += "DROP INDEX " + this.escapeId(indexName);
    }

    sql += ");";
    return sql;
  }

  sqlInsert(engram, construct) {

    let names = Object.keys(construct);
    let values = Object.values(construct);

    let sql = "INSERT INTO " + engram.smt.schema + " (";
    let first = true;
    for (let name of names) {
      (first) ? first = false : sql += ",";
      sql += this.escapeId(name);
    }
    sql += ") VALUES (";
    first = true;
    for (let i = 0; i < names.length; i++) {
      let name = names[i];
      let value = values[i];
      let field = engram.find(name);
      (first) ? first = false : sql += ",";
      sql += encodeValue(field, value);
    }
    sql += ")";

    logger.debug(sql);
    return sql;
  }

  sqlBulkInsert(engram, constructs) {

    // all constructs MUST have the same fields
    let names = Object.keys(constructs[0]);

    let sql = "INSERT INTO " + engram.smt.schema + " (";
    let first = true;
    for (let name of names) {
      (first) ? first = false : sql += ",";
      sql += this.escapeId(name);
    }
    sql += ") VALUES ";
  
    first = true;
    for (let construct of constructs) {
      (first) ? first = false : sql += ",";
      sql += "(";

      let vfirst = true;
      for (let i = 0; i < names.length; i++) {
        let name = names[i];
        let value = construct[name];
        let field = engram.find(name);
        (vfirst) ? vfirst = false : sql += ",";
        sql += encodeValue(field, value);
      }
      sql += ")";
    }

    logger.debug(sql);
    return sql;
  }

  sqlUpdate(engram, construct) {

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
        sql += this.escapeId(name) + "=" + encodeValue(field, value);
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
        sql += this.escapeId(name) + "=" + encodeValue(field, value);
      }
    }

    logger.debug(sql);
    return sql;
  }

  /**
   * options: {fieldname: value, ...}
   */
  sqlWhereByKey(engram, pattern) {
    const match = (pattern && pattern.match) || pattern || {};
    let sql = "";

    if (engram.keys.length > 0) {
      sql += " WHERE ";

      let first = true;
      for (let key of engram.keys) {
        let value = match[key];
        if (typeof value === "undefined")
          throw "key value undefined " + key;
        (first) ? first = false : sql += " AND ";
        sql += this.escapeId(key) + "=" + encodeValue(engram.find(key), value);
      }
    }

    logger.debug(sql);
    return sql;
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
  sqlSelectByPattern(engram, pattern) {

    let sql = "SELECT ";

    // LIMIT clause
    if (pattern.count)
      sql += `TOP ${pattern.count} `;

    // OUTPUT COLUMNS
    let columns = [];
    if (pattern.fields) {
      for (let f of pattern.fields)
        columns.push(this.escapeId(f));
    }
    else if (pattern.aggregate) {
      // find all the {"func": "field"} expressions
      for (let [name, exp] of Object.entries(pattern.aggregate)) {
        for (let [func, value] of Object.entries(exp)) {
          if (typeOf(value) === "object") {
            // the field to group by
            let groupby = this.escapeId(name);
            if (!columns.includes(groupby))
              columns.push(groupby);
            // aggregate columns for GROUP BY
            let asfld = func;
            for (let [func, fld] of Object.entries(value)) {
              let exp = sqlFunction(func) + "(" + this.escapeId(fld) + ")";
              columns.push(exp + " as " + this.escapeId(asfld));
            }
          }
          else {
            // aggregate columns for summary
            let asfld = name;
            let fld = value;
            let exp = sqlFunction(func) + "(" + this.escapeId(fld) + ")";
            columns.push(exp + " as " + this.escapeId(asfld));
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
      sql += " WHERE ";

      let first = true;
      for (let [fldname, value] of Object.entries(pattern.match)) {
        if (typeOf(value) === 'object') {
          // expression(s) { op: value, ...}
          for (let [op, val] of Object.entries(value)) {
            (first) ? first = false : sql += " AND ";

            sql += this.escapeId(fldname);
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
          sql += this.escapeId(fldname) + "=" + encodeValue(engram.find(fldname), value);
        }
      }
    }

    // GROUP BY clause
    if (pattern.aggregate) {
      let f = true;
      // find group by fields of aggregate: {"group_by_field": {"func": "field"} }
      for (let [groupby, exp] of Object.entries(pattern.aggregate)) {
        for (let [fld, funcfld] of Object.entries(exp)) {
          if (typeOf(funcfld) === "object") {
            // group by field
            if (f) sql += " GROUP BY ";
            (f) ? f = false : sql += ",";
            sql += this.escapeId(groupby);
          }
          // else not groupby
          break;
        }
        // should only be on aggregate.property for group by
      }
    }

    // ORDER BY clause
    if (pattern.order) {
      sql += " ORDER BY ";
      let f = true;
      for (const [name, direction] of Object.entries(pattern.order)) {
        (f) ? f = false : sql += ",";
        sql += this.escapeId(name) + " " + direction;
      }
    }

    return sql;
  }

  sqlFunction(cfunc) {
    switch (cfunc) {
      case 'sum': return 'SUM';
      case 'avg': return 'AVG';
      case 'min': return 'MIN';
      case 'max': return 'MAX';
      case 'count': return 'COUNT';
      default: return cfunc;
    }
  }

}
