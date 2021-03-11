const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const glob = require('glob');
const {ignoreFilesGlobs} = require('./common');
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
        const relativeImagesDir = path.relative(destDir, destImagesDir);
        const data = fs.readFileSync(srcFilePath, "utf-8");
        const output = data.replace(/^:imagesdir:.*$/gm, `:imagesdir: ${relativeImagesDir}`);
        fs.writeFileSync(destFilePath, output);
        if (fs.pathExistsSync(srcImagesDir)) {
            fs.copySync(srcImagesDir, destImagesDir)
        }
    });
    // Needed to stop the splitter erroring
    fs.mkdirpSync(path.join(destDir, 'titles-enterprise'));
    return destDir;
}

const split = (dir) => {
    const jarDir = path.normalize(`${__dirname}/../binaries/splitter`);
    const jarName = `asciidoc-splitter-1.0-SNAPSHOT.jar`;
    const destDir = path.normalize(`${__dirname}/../${tmpDirName}/post-splitter`);
    rimraf.sync(destDir);
    const splitterCommandBase = `java -cp ${jarDir}/${jarName}:${jarDir}/* com.redhat.documentation.asciidoc.cli.ExtractionRunner`;
    const cmd = `${splitterCommandBase} -s ${dir} -o ${destDir}`;
    execSync(cmd,
        {
            stdio: 'inherit'
        });
}

const publish = (dir) => {

}


const srcDir = generateSplitterInput(path.normalize(`${__dirname}/../../`));
const destDir = split(srcDir);
publish(destDir);