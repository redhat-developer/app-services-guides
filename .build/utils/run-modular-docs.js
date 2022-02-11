var docs = require("./modular-docs");
const path = require('path')

const srcDir = docs.generateSplitterInput(path.normalize(`${__dirname}/../../docs`));
docs.split(srcDir);