# authStash Credentials

The _Storage.authStash_ is a map type cache of credentials. It is used by the Codex, junctions and filesystems to look up credentials if they were not provided by the application.

Using the credentials authStash is useful if the Codex entries are going to be displayed to end users and data source credentials are considered a security risk.

Credential values don't have to be stored in authStash. Depending upon the data source, applications can also include them in the _smt.locus_ field or an _options.auth_ object.

## authStash Entries

### Key Values

The key for the storing and recalling credentials is obtained from the smt.locus field. If the smt.locus is a URL like http:// or ftp:// then the key is url.origin, for example _<http://www.census.gov>_. If the smt.locus is not a URL then the smt.locus field is used as is, for example a database connection string; _server=dev.dictadata.org;database=storage_node_.

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

A authStash credentials can be loaded using _Storage.authStash.load()_ method.

```javascript
var Storage = require("@dictadata/storage-junctions");

Storage.authStash.load("./auth_stash.json");
```

## Example authStash File

```json
{
  "http://dev.dictadata.org:9200": {
    "desciption": "elasticsearch",
    "auth" : {
      "apiKey": "abc123dorami"
    }
  },
  "ftp://dev.dictadata.org": {
    "description": "ftp server",
    "auth": {
      "username": "dicta",
      "password": "data"
    }
  },
  "server=dev.dictadata.org;database=storage_node": {
    "description": "MS SQL database",
    "auth": {
      "username": "dicta",
      "password": "data"
    }
  }
}
```
