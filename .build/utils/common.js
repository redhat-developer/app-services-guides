const fs = require('fs-extra');
const path = require('path');

const ignoreFilesGlobs = () => {
    const ignoreFilesGlobs = fs.readFileSync(path.normalize(`${__dirname}/../../.adocignore`), "utf-8").toString();
    return ignoreFilesGlobs.split("\n").filter(line => !line.startsWith("#")).filter(line => line !== "")
};

module.exports = {ignoreFilesGlobs}