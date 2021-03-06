// node process event handlers for testing

const unhandledRejections = new Map();

process.on('unhandledRejection', (reason, promise) => {
  unhandledRejections.set(promise, reason);
});
process.on('rejectionHandled', (promise) => {
  unhandledRejections.delete(promise);
});

process.on('multipleResolves', (type, promise, reason) => {
  console.log("multipleResolves");
  console.error(type + ", " + JSON.stringify(promise) + ", " + reason);
  setImmediate(() => process.exit(1));
});

process.on('warning', (warning) => {
  console.warn(warning.name);
  console.warn(warning.message);
  console.warn(warning.stack);
});

process.on('beforeExit', (code) => {
  console.log('Process beforeExit event with code: ', code);
});

process.on('exit', (code) => {
  console.log('Process exit event with code: ', code);
  for (let [promise, reason] of unhandledRejections)
    console.log(`unhandledPromise ${promise}: ${reason}`);
  if (unhandledRejections.size > 0)
    process.exitCode = 1;
});
