# codify transform

Infers encoding from a stream of constructs.
Usage: Pipe a stream of constructs to codifyTransform then read the stream output or get encoding property.
It is up to the application to provide a representative sample of constructs as input.

## example using codify transform

```javascript
/**
 *
 * @param {String|Object} smt SMT of data source to codify
 * @param {object} options
 * @param {object} options.encoding optional engram encoding to use as a seed
 */
async function codifyCSV(smt, options) {

  try {
    let jo = await Storage.activate("csv|file:/pathtofile/|somefile.csv|*", options);
    let reader = jo.createReader();
    let codify = await Storage.activateTransform("codify", options);

    await stream.pipeline(reader, codify);

    let encoding = codify.encoding;

    return encoding;
  }
  catch (err) {
    console.log(err.message);
  }
  finally {
    await jo.relax()
  }
}

let smt = "csv|./test/_data/input/|foofile.csv|*";
let options: {
  hasHeader: true
}

let encoding = await codifyCSV(smt, options);

console.log( JSON.stringify(encoding) );
```
