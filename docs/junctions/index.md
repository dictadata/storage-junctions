# Storage Junctions

## Storage-Junction

[StorageJunction](storage-junction.md) is the base class for all storage junction modules.

## Supported Storage Sources

| model         | encoding | store | recall | retrieve | dull  | streamable | key-value | documents | tables |
| ------------- | :------: | :---: | :----: | :------: | :---: | :--------: | :-------: | :-------: | :----: |
| [csv](csv-junction.md)           |   no    |  no   |   no   |    -     |  no   |    yes     |    no     |    no     |  yes   |
| [json](json-junction.md)          |   no    |  no   |   no   |    -     |  no   |    yes     |    no     |    yes    |  yes   |
| [elasticsearch](elasticsearch-junction.md) |   yes    |  yes  |  yes   |   yes    |  yes  |    yes     |    yes    |    yes    |  yes   |
| [memory](memory-junction.md)        |          |       |        |          |       |            |    yes    |    no     |   no   |
| [mssql](mssql-junction.md)         |   yes    |  yes  |  yes   |   yes    |  yes  |    yes     |    no     |     -     |  yes   |
| [mysql](mysql-junction.md)         |   yes    |  yes  |  yes   |   yes    |  yes  |    yes     |    no     |     -     |  yes   |
| [oracledb](oracledb-junction.md)      |   yes    |  yes  |  yes   |   yes    |  yes  |    yes     |    no     |     -     |  yes   |
| [pdf](shapes-junction.md)   |   no    |  no   |  no    |   no     |  no   | read-only  |    no     |    no     |  yes   |
| [redshift](rest-junction.md)      |   yes    |  yes  |  yes   |   yes    |  yes  |    yes     |    no     |     -     |  yes   |
| [rest](rest-junction.md)          |   no    |   -   |   -    |   yes    |   -   |    yes     |     -     |     -     |  yes   |
| [shapefile](shapefile-junction.md)   |   no    |  no   |  no    |   no     |  no   | read-only  |    no     |    no     |  yes   |
| [template](template-junction.md)   |   no    |  no   |  no    |   no     |  no   | write-only  |    no     |    yes     |  no   |
| [xlsx](xlsx-junction.md)  |   no    |   -   |   -    |    -     |   -   |    yes     |    no     |    no     |  yes   |
| \*parquet     |   yes    |  no   |   no   |    -     |  no   |    yes     |    no     |    yes    |  yes   |
| \*mongodb     |   yes    |       |        |          |       |            |    yes    |    yes    |  yes   |

\* In the plans for future development.
&dash; Not planned, but will be developed as needed.
