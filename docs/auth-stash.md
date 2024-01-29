# Storage.Codex.auth. Credentials

The _Storage.Storage.Codex.auth._ is a map type cache of credentials. It is used by the Codex, junctions and filesystems to look up credentials if they were not provided by the application.

Using the credentials Storage.Codex.auth. is useful if the Codex entries are going to be displayed to end users and data source credentials are considered a security risk.

Credential values don't have to be stored in Storage.Codex.auth.. Depending upon the data source, applications can also include them in the _smt.locus_ field or an _options.auth_ object.

## Storage.Codex.auth. Entries

### Key Values

The key for the storing and recalling credentials is obtained from the smt.locus field. If the smt.locus is a URL like http:// or ftp:// then the key is url.origin, for example _<http://www.census.gov>_. If the smt.locus is not a URL then the smt.locus field is used as is, for example a database connection string; _server=dev.dictadata.net;database=storage_node_.

### Entry Properties

Common supported properties are:

```javascript
"host=dbserv;database=my_db": {
  auth: {
    username: "my_name",
    password: "my_password"
  }
}
```

or

```javascript
"https://www.server.com:1234": {
  auth: {
    apiKey: "abc123dorami"
  }
}
```

## Loading a Credentials file

A Storage.Codex.auth. credentials can be loaded using _Storage.Storage.Codex.auth..load()_ method.

```javascript
var Storage = require("@dictadata/storage-junctions");

Storage.Storage.Codex.auth..load("./auth_stash.json");
```

## Example Storage.Codex.auth. File

```json
{
  "http://dev.dictadata.net:9200": {
    "desciption": "elasticsearch",
    "auth" : {
      "apiKey": "abc123dorami"
    }
  },
  "ftp://dev.dictadata.net": {
    "description": "ftp server",
    "auth": {
      "username": "dicta",
      "password": "data"
    }
  },
  "server=dev.dictadata.net;database=storage_node": {
    "description": "MS SQL database",
    "auth": {
      "username": "dicta",
      "password": "data"
    }
  }
}
```
