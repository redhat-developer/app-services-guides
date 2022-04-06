const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const glob = require('glob');
const {ignoreFilesGlobs, injectAttributes} = require('./common');
const {execSync} = require('child_process');
const yaml = require("yaml");

const tmpDirName = "tmp";

// Generate the glob for the modular-docs search to include only the guides for specific product
getAndValidateMappingsFile = (dir) => {
    if(!process.env.DOCS_PRODUCT_NAME) {
        throw new Error(`Missing DOCS_PRODUCT_NAME environment variable`);
    }

    serviceMappingsLocation = path.join(dir, ".product-mapping.yml");
    console.info("Reading service mappings from " + serviceMappingsLocation);
    if(!fs.existsSync(serviceMappingsLocation)){
        throw new Error(`".product-mapping.yml" file not found in ${dir}`);
    }
    serviceMappingsFileContent = fs.readFileSync(serviceMappingsLocation, 'utf8').toString()
    mappingsJson = yaml.parse(serviceMappingsFileContent);

    // Validate if every path is valid
    for(productName in mappingsJson.products){
        directories = mappingsJson.products[productName].directories;
        if(directories){
            directories.forEach(function(directory){
                if(!fs.existsSync(path.join(dir, directory))) {
                    throw new Error(`"${directory}" not found in ${dir}`);
                }
            });
        }        
    }
  

    mappings = mappingsJson.products[process.env.DOCS_PRODUCT_NAME];
    if(mappings === undefined) {
        throw new Error(`No mappings found for ${process.env.DOCS_PRODUCT_NAME}`);
    }

    if(mappings.directories === undefined || mappings.directories.length === 0) {
        throw new Error(`No directories found for ${process.env.DOCS_PRODUCT_NAME}`);
    }
    var glob =  "("+mappings.directories.join("|") + ")"
    return { glob, mappings}
}

// Get all the .adoc files for the product set in the env variable
var getAllAdocFiles = function (dir) {
    var pathGlob = getAndValidateMappingsFile(dir).glob;
     // ignores
     const ignore = ignoreFilesGlobs();
     console.info(`Ignoring files ${ignore.join(", ")}`)
     console.info()

     const readmes = glob.sync(`@${pathGlob}/**/@(readme|README).a?(scii)doc`, {
         cwd: dir,
         ignore
     });

     return readmes
}

/**
 * Converts the guides to the modular-docs format https://github.com/redhat-documentation/modular-docs
 * @param dir the dir to convert
 */
function generateSplitterInput(dir) {
    // Create a clean working area
    const destDir = path.normalize(`${__dirname}/../${tmpDirName}/pre-splitter/guides`);
    console.log(`Generating from ${dir} into ${destDir}`)
    rimraf.sync(destDir);
    fs.mkdirpSync(destDir);
    
    const imageRefRegex = /(?<macro>image::)(?<path>[^\[]*)(?<attributesArray>\[[^\]]*])/gm;
   
    var readmes = getAllAdocFiles(dir)
    console.info(`Converting ${readmes.join(", ")} to modular docs`);

    readmes.forEach(p => {
        const id = path.dirname(p).replace(/\//g, '-');
        const destFilename = `chap-${id}.adoc`;
        const srcFilePath = path.join(dir, p);
        const srcImagesDir = path.join(srcFilePath.substring(0, srcFilePath.lastIndexOf("/")), "images");
        const destFilePath = path.join(destDir, destFilename);
        const destImagesDir = path.join(destDir, "_images", id);
        let data = fs.readFileSync(srcFilePath, "utf-8").toString();
        const imageFiles = glob.sync(path.join(srcImagesDir, "**/*"));
        imageFiles.forEach(f => {
            const destImageFile = path.join(destImagesDir, path.basename(f));
            console.log(`Copying file ${f} to ${destImageFile}`);
            fs.copySync(f, destImageFile);
            const relativePathToImage = f.replace(`${srcImagesDir}/`, "");
            data = data.replace(imageRefRegex, function (match, macro, docPath, attributesArray) {
                if (docPath === relativePathToImage) {
                    return `${macro}${path.join(id, docPath)}${attributesArray}`;
                }
                return match;
            });
        });
        data = injectAttributes(data, "");
        fs.writeFileSync(destFilePath, data);
    });
    // Needed to stop the splitter erroring
    fs.mkdirpSync(path.join(destDir, 'titles-enterprise'));
    return destDir;
}

const split = (dir) => {
    const jarLocation = path.normalize(`${__dirname}/../tmp/binaries/splitter/asciidoc-splitter-1.5.3-jar-with-dependencies.jar`);
    const destDir = path.normalize(`${__dirname}/../${tmpDirName}/post-splitter`);
    rimraf.sync(destDir);
    const splitterCommandBase = `java -jar ${jarLocation}`;
    const cmd = `${splitterCommandBase} -s ${dir} -o ${destDir} --pantheonV2`;
    execSync(cmd,
        {
            stdio: 'inherit'
        });
}

module.exports = { getAllAdocFiles, getAndValidateMappingsFile, generateSplitterInput, split };

