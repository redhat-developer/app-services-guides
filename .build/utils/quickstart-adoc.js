const yaml = require("yaml");
const path = require("path");
const jp = require("jsonpath");
const fs = require("fs");
const {JSDOM} = require("jsdom");
const fetch = require('sync-fetch');
const asciidoctor = require('asciidoctor')();
const Ajv = require("ajv").default;

const pantheonBaseUrl = process.env.PANTHEON_URL || "https://pantheon.corp.redhat.com/api";

const buildQuickStart = (content, filePath, basePath, asciidocOptions) => {


  const validateJSON = (instance, schemaPath) => {
    const ajv =  new Ajv();
    const rawSchema = fs.readFileSync(schemaPath, "utf8").toString();
    const schema = JSON.parse(rawSchema);
    const validate = ajv.compile(schema);
    const valid = validate(instance);
    if (!valid) {
      throw new Error(`${filePath} ${validate.errors.map(error => error.message).toString()}`);
    }
  }

  const snippetCache = {};

  const pantheonMappingsPath = path.join(basePath, "pantheon.yml");

  let pantheonMappings;

  if (fs.existsSync(pantheonMappingsPath)) {
    // load the pantheon mappings
    pantheonMappings = yaml.parse(fs.readFileSync(pantheonMappingsPath, 'utf8').toString());
    // validate it
    validateJSON(pantheonMappings, path.join("../", "pantheon.schema.json"));
  }

  const loadSnippet = (ref, tag, type, asciiDocCallback, defaultPathExpression, defaultCssSelector) => {
    if (pantheonMappings) {
      // Load from pantheon, if mapped
      const answer = loadFromPantheon(ref, tag, defaultPathExpression, defaultCssSelector);
      if (answer) {
        return answer;
      }
      // otherwise continue to load from asciidoc
    }
    if (!snippetCache[ref]) {
      const parts = ref.split("#");
      if (parts.length !== 2) {
        throw Error(`malformed ${tag} ${ref}, must be like !${tag} README.adoc#task-1`);
      }
      const fileName = parts[0];
      const filePath = path.normalize(path.join(basePath, fileName));
      const adoc = asciidoctor.loadFile(filePath, asciidocOptions);
      // create an array with all the blocks in the doc in it
      const blocks = flattenBlocks(adoc);
      blocks
        // only blocks with an id can be used
        .filter(block => block.getId())
        // If we are looking for a particular moduleType, we can filter for it
        .filter(block => type ? getModuleType(block) === type : true)
        .forEach(block => {
          const id = block.getId().replace(/-\{context\}$/, "");
          snippetCache[`${fileName}#${id}`] = block;
        });
    }
    if (!snippetCache[ref]) {
      throw new Error(`unable to locate snippet for ${tag} ${ref}`);
    }
    // Apply the callback, if passed
    if (asciiDocCallback) {
      return asciiDocCallback(snippetCache[ref]);
    }
    return snippetCache[ref];
  }

  const loadFromPantheon = (ref, tag, defaultPathExpression, defaultCssSelector) => {
    const mapping = pantheonMappings[`${tag} ${ref}`];
    if (!mapping) {
      return undefined;
    }
    let uuid, type, cssSelector, pathExpression;

    if (typeof mapping === "object") {
      uuid = mapping["uuid"];
      type = mapping["type"];
      cssSelector = mapping["cssSelector"] || defaultCssSelector;
      pathExpression = mapping["jsonPathExpression"] || defaultPathExpression;
    } else if (typeof mapping === "string"){
      if (mapping.startsWith("https")) {
        const parts = mapping.match(/https:\/\/.*\/api\/(\w*)\/.*\/([a-z0-9-]*)/);
        if (parts.length !== 3) {
          throw new Error(`Unable to parse ${mapping} as pantheon URL`);
        }
        type = parts[1];
        uuid = parts[2];
        cssSelector = defaultCssSelector;
        pathExpression = defaultPathExpression;
      }
    } else {
      throw new Error("${tag} ${ref} mapping to pantheon API is unsupported, should either be a URL or have keys for uuid and type");
    }

    if (!uuid) {
      throw new Error(`uuid not set in ${pantheonMappingsPath}`)
    }
    if (!type) {
      throw new Error(`type not set in ${pantheonMappingsPath}`)
    }
    const data = loadFromPantheonApi(uuid, type, pathExpression);
    const result = jp.nodes(data, pathExpression);
    return result
      .map(node => {
        const path = node["path"];
        if (cssSelector && path && path[path.length - 1] === "body") {
          const dom = new JSDOM(node["value"]);
          return dom.window.document.querySelector(cssSelector);
        }
        return node["value"];
      })
      .reduce(((previousValue, currentValue) => `${previousValue} ${currentValue}`), "");
  };

  const loadFromPantheonApi = (uuid, type) => {
    const url = `${pantheonBaseUrl}/${type}/variant.json/${uuid}`;
    const res = fetch(url)
    if (res.status != 200) {
      throw new Error(`error fetching from pantheon ${res.status} ${res.text()}`)
    }
    return res.json();
  };

  const flattenBlocks = (block) => {
    const flat = [];

    flat.push(block);
    if (block.hasBlocks()) {
      block.getBlocks().forEach(block => {
          flat.push(...flattenBlocks(block));
      });
    }
    return flat;
  }

  const snippetTag = {
    identify: value => value instanceof asciidoctor.AbstractBlock,
    tag: '!snippet',
    resolve: (doc, cst) => {
      const parts = cst.strValue.split("#");
      if (parts.length !== 2) {
        throw Error(`malformed !snippet ${cst.str}, must be like !snippet README.adoc#task-1`);
      }
      const id = parts[1];
      return loadSnippet(cst.strValue, "!snippet", undefined, (block) => block.convert(), '$.*.body', `#${id}`);
    },
    stringify(item) {
      return item.convert();
    }
  };

  const procTag = {
    identify: value => value instanceof asciidoctor.AbstractBlock && getModuleType(value) === "proc",
    tag: '!snippet/proc',
    resolve: (doc, cst) => loadSnippet(cst.strValue, "!snippet/proc", "proc", (block) => block.convert(), '$.*.body'),
    stringify: () => ""
  };

  const titleTag = {
    identify: false,
    tag: '!snippet/title',
    resolve: (doc, cst) => loadSnippet(cst.strValue, "!snippet/title", undefined,(block) => block.getTitle(), '$.*.title'),
    stringify: () => ""
  };

  // load the yaml
  const qs = yaml.parse(content.toString(), {
    customTags: [snippetTag, procTag, titleTag]
  });

  validateJSON(qs, path.join("../", "quickstart.schema.json"));

  // transform the yaml to json for the browser to load
  const json = JSON.stringify(qs);
  return json;
}



const MODULE_TYPE_ATTRIBUTE = "module-type";

const getModuleType = (node) => {
  if (node.getAttributes()[MODULE_TYPE_ATTRIBUTE]) {
    return node.getAttributes()[MODULE_TYPE_ATTRIBUTE];
  }

  const id = node.getId();

  if (id && id.startsWith("con-")) {
    return "con";
  }

  if (id && id.startsWith("proc-")) {
    return "proc";
  }

  if (id && id.startsWith("ref-")) {
    return "ref";
  }
  return "unknown"; // punt, we don't know
}

exports.buildQuickStart = buildQuickStart;
