async function asdf() {
  (await 1) || (await 2);
  (await b)();
  new (await b)();
  true ? (await 1) : (await 2);
  await (await 1);
}

async function a(b) {
  (await xhr({ url: "views/test.html" })).data;
}
