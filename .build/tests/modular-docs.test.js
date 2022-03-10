var docs = require("../utils/modular-docs");
const path = require("path");

const docPath = path.normalize(`${__dirname}/../../docs`);

test("Fail when env is missing", () => {
  process.env.DOCS_PRODUCT_NAME = undefined;
  expect(() => {
    docs.getAndValidateMappingsFile(docPath);
  }).toThrow();
});

test("Fail when mapping file is missing", () => {
  process.env.DOCS_PRODUCT_NAME = "RHOSAK";
  expect(() => {
    docs.getAndValidateMappingsFile(
      path.normalize(`${__dirname}/../../docs/whatever`)
    );
  }).toThrow();
});

test("Fail on wrong env name", () => {
  process.env.DOCS_PRODUCT_NAME = "RHPETE";
  expect(() => {
    docs.getAndValidateMappingsFile(docPath);
  }).toThrow();
});

test("Should return globs for rhosak", () => {
  process.env.DOCS_PRODUCT_NAME = "RHOSAK";
  data = docs.getAndValidateMappingsFile(
    docPath
  );
  expect(data.glob).toBeDefined();
  expect(data.mappings).toBeDefined();
});


test("Should get all addoc files RHOSAK", () => {
    process.env.DOCS_PRODUCT_NAME = "RHOSAK";
    var files = docs.getAllAdocFiles(docPath)
    console.info(files)
    expect(files.length > 1).toBeTruthy();
});

test("Should get all addoc RHOSR", () => {
    process.env.DOCS_PRODUCT_NAME = "RHOSR";
    var files = docs.getAllAdocFiles(docPath)
    console.info(files)
    expect(files.length > 1).toBeTruthy();
});
  

test("Should get all addoc files RHOC", () => {
    process.env.DOCS_PRODUCT_NAME = "RHOC";
    var files = docs.getAllAdocFiles(docPath)
    console.info(files)
    expect(files.length > 1).toBeTruthy();
});
  
  
  