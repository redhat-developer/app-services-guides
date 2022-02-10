const fs = require("fs-extra");
const path = require("path");
const {injectAttributesIntoFileTree} = require("./common");

const attributesFileName = path.join("_artifacts", "docs", "document-attributes.adoc");

const processAttributes = () => {
    const rootDir = path.normalize(`${__dirname}/../../`);
    const rawAttributes = fs.readFileSync(path.join(rootDir, attributesFileName), "utf-8").toString();
    return injectAttributesIntoFileTree(rootDir, rawAttributes);
};

processAttributes();