- version 1.0.2
  - return elasticsearch key(s) for list inserts 
- version 1.0.1
  - prevent empty string as elasticsearch key
- version 1.0.0
  - StorageResults now returns an array (list) for row or column stores (tables) and an object (dictionary map) for document and key-value stores. This allows return of data source generated keys while not polluting data objects.  Single data objects will no longer be return.
  