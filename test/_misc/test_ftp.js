const { Writable } = require('node:stream');
const zlib = require('node:zlib');
const ftp = require('basic-ftp');

const pathname = "/dictadata/test/data/input/";
const filename = "foofile.csv";

const client = new ftp.Client();
client.ftp.verbose = true;

(async () => {
  let ws;

  try {

    // connect to host
    let result = await client.access({
      host: "dev.dictadata.net",
      port: 21,
      user: 'dicta',
      password: 'data',
      secure: false
    });
    console.log("access " + JSON.stringify(result));

    client.trackProgress(info => {
      console.log(JSON.stringify({
        "File": info.name,
        "Type": info.type,
        "Transferred": info.bytes,
        "Transferred Overall": info.bytesOverall
      }));
    })

    // ftp writes to passthrough and app reads from passthrough
    //let spt = new stream.PassThrough();
    ws = new Writable({
      write(data, encoding, callback) {
        console.log(data.toString());
        callback();
      },
      flush(callback) {
        callback();
      }
    })

    ///// check for zip
    if (filename.endsWith('.gz')) {
      var decoder = zlib.createGunzip({ flush: zlib.constants.Z_PARTIAL_FLUSH });
      spt.pipe(decoder);
      rs = decoder;
    }

    // create the read stream
    result = await client.cd(decodeURI(pathname));
    console.log("cd " + JSON.stringify(result));

    result = await client.downloadTo(ws, filename);
    console.log("downloadTo " + JSON.stringify(result));

    // create the read stream
    result = await client.cd("/dictadata/");
    console.log("cd " + JSON.stringify(result));

  }
  catch (err) {
    console.log(err)
  }

  await client.close();
  console.log("close");

})();
