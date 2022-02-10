var docs = require("../utils/modular-docs")
const path = require('path')

test('Fail when env is missing', () => {
    expect(() => {
        docs.getAndValidateMappingsFile(path.normalize(`${__dirname}/../../docs`))
      }).toThrow();
   
});

test('Fail when mapping file is missing', () => {
    expect(() => {
        docs.getAndValidateMappingsFile(path.normalize(`${__dirname}/../../docs/whatever`))
      }).toThrow();
});

// test('Fail on wrong env name', () => {
//     process.env.DOCS_PRODUCT_NAME="RHPETE"
//     expect(() => {
//         docs.getAndValidateMappingsFile(path.normalize(`${__dirname}/../../docs`))
//       }).toThrow();
// });

test('Pass and return globs for rhosak', () => {
    process.env.DOCS_PRODUCT_NAME="RHOSAK"
    data = docs.getAndValidateMappingsFile(path.normalize(`${__dirname}/../../docs`))
    expect(data.glob).toBeDefined()
    expect(data.mappings).toBeDefined()
});