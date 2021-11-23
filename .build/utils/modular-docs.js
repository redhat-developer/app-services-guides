const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const glob = require('glob');
const {ignoreFilesGlobs, injectAttributes} = require('./common');
const {execSync} = require('child_process');

const tmpDirName = "tmp";

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
    // ignores
    const ignore = ignoreFilesGlobs();
    console.log(`Ignoring ${ignore.join(", ")}`)
    const readmes = glob.sync(`**/@(readme|README).a?(scii)doc`, {
        cwd: dir,
        ignore
    });
    console.log(`Converting ${readmes.join(", ")} to modular docs`);
    readmes.forEach(p => {
        const id = path.dirname(p);
        const destFilename = `chap-${id}.adoc`;
        const srcFilePath = path.join(dir, p);
        const srcImagesDir = path.join(dir, id, "images");
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
    const jarDir = path.normalize(`${__dirname}/../tmp/binaries/splitter`);
    const jarName = `asciidoc-splitter-jar-with-dependencies.jar`;
    const destDir = path.normalize(`${__dirname}/../${tmpDirName}/post-splitter`);
    rimraf.sync(destDir);
    const splitterCommandBase = `java -cp ${jarDir}/* io.github.lightguard.documentation.asciidoc.cli.ExtractionRunner`;
    const cmd = `${splitterCommandBase} -s ${dir} -o ${destDir} --pantheonV2`;
    execSync(cmd,
        {
            stdio: 'inherit'
        });
}

const srcDir = generateSplitterInput(path.normalize(`${__dirname}/../../`));
split(srcDir);