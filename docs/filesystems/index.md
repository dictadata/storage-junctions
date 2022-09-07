# Storage FileSystems

## Storage-FileSystem

[Storage-FileSystem](storage-filesystem.md) is the base class for all file system modules.

## Supported File Systems

File Storage systems provide read and write streams to objects (files) on local and cloud storage systems.
GZip compression is handled seemlessly based on filename extension .gz.

| model        | list  | read  | write | scan  | upload | download |
| ------------ | :---: | :---: | :---: | :---: | :---:  |   :---:  |
| [local](fs-filesystem.md)        |  yes  |  yes  |  yes  |  yes  |   -    |     -    |
| [FTP](ftp-filesystem.md)          |  yes  |  yes  |  yes  |  yes  |  yes   |    yes   |
| [HTTP](http-filesystem.md)         |  yes  |  yes  |  \*no |  yes  |  yes   |   \*no   |
| [AWS S3](s3-filesystem.md)       |  yes  |  yes  |  yes  |  yes  |  yes   |    yes   |
| [ZIP file](zip-filesystem.md)     |  yes  |  yes  |  no   |  yes  |  no    |    yes   |
| \*scp        |   -   |   -   |   -   |   -   |   -    |     -    |
| \*Azure ADLS |   -   |   -   |   -   |   -   |   -    |     -    |
| \*Google CS  |   -   |   -   |   -   |   -   |   -    |     -    |

\* Not currently planned for development.
&dash; Not planned, but will be developed as needed.
