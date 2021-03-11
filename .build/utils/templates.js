// Not currently in use, as the templates are in haml, which asciidoctor.js doesn't support it

const {execSync} = require('child_process');
const mkdirp = require('mkdirp');
const path = require('path');
const rimraf = require('rimraf');
const fs = require('fs-extra');

const cloneTemplates = () => {

  const clonePath = path.join(__dirname, "tmp-git");
  rimraf.sync(clonePath);
  mkdirp.sync(clonePath);
  const pwd = process.cwd();
  process.chdir(clonePath);

  const gitRepoUrl = process.env.GIT_REPO_URL || "https://github.com/redhataccess/pantheon.git";
  const gitRepoPath = process.env.GIT_REPO_PATH || "pantheon-bundle/src/main/resources/apps/pantheon/templates/haml/html5";
  const gitClone = `git clone --quiet --depth 1 --filter=blob:none --sparse ${gitRepoUrl} .`
  const gitSparseCheckoutInit = `git sparse-checkout init --cone`;
  const gitSparseCheckoutSet = `git sparse-checkout set ${gitRepoPath}`;
  execSync(gitClone);

  execSync(gitSparseCheckoutInit);

  execSync(gitSparseCheckoutSet);

  process.chdir(pwd);
  const srcPath = path.join(clonePath, gitRepoPath);
  const dstPath = "tmp/templates";

  rimraf.sync(dstPath);
  fs.mkdirpSync(dstPath);
  fs.copySync(srcPath, dstPath);

  rimraf.sync(clonePath);

}

cloneTemplates();
