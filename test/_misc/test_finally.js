#!/usr/bin/env node

function thecode() {

  try {
      console.log("trying outer");
    try {
      console.log("trying inner");
      throw new StorageError('oops');
      return "gotcha";
    } catch (ex) {
      console.error('inner', ex.message);
      return "no throw";
      throw ex;
    } finally {
      console.log('finally');
    }
  } catch (ex) {
    console.error('outer', ex.message);
  }

  return "normal";
}

(() => {
  let results = thecode();
  console.log(results);
})();

// Output:
// "inner" "oops"
// "finally"
// "outer" "oops"
