let Url;
try {
  Url = new URL("/test/data", "http://localhost/");
} catch (error) {
  console.log(error.message);
}
