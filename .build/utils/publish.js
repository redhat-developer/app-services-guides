const path = require('path');
const {execSync} = require('child_process');

const publish = () => {
    const tmpdir = path.normalize(`${__dirname}/../tmp/post-splitter`);
    const branch = process.env["npm_config_branch"] || "modular-docs";
    const repo = process.env["npm_config_repo"];
    const repoArg = repo ? `-r ${repo}` : '';
    const cmd = `gh-pages -d ${tmpdir} -b ${branch} ${repoArg}`;
    console.log(`Committing and push ${tmpdir} to ${branch} on ${repo || "origin"}`)
    execSync(cmd,
        {
            stdio: 'inherit'
        });
}

publish();
