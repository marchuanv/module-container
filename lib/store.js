(async () => {

    const utils = await require('utils');
    const githubBranch = await require('lib/github-branch.js');
    const githubFile = await require('lib/github-file.js');

    const privateKey = process.env.GIT;
    process.store = { sessionId: utils.generateGUID(), name: '%root%', isDirectory: false, isFile: false, extension: null, children: [] };

    const existsSync = async (filePath) => {
        const fileName = path.basename(filePath);
        if (process.store[fileName]) {
            return true;
        } else {
            return await githubFile.isExisting({ branchName: process.store.sessionId, fileName });
        }
    }
    process.store["existsSync"] = existsSync;

    const writeFileSync = async (filePath, data) => {
        const fileName = path.basename(filePath);
        await githubFile.ensureFileContent({ branchName: process.store.sessionId, fileName, content: data });
        process.store[fileName] = data;
    }
    process.store["writeFileSync"] = writeFileSync;

    const readFileSync = async (filePath) => {
        const fileName = path.basename(filePath);
        if (process.store[fileName]) {
            return process.store[fileName];
        }
        const script = await githubFile.getFileContent({ branchName: process.store.sessionId, fileName });
        if (script) {
            process.store[fileName] = script;
            return script;
        }
        throw new Error(`${fileName} does not exist.`)
    }
    process.store["readFileSync"] = readFileSync;

    const rmSync = async (filePath) => {
        const fileName = path.basename(filePath);
        await githubFile.deleteFile({ branchName: process.store.sessionId, fileName });
        delete process.store[fileName];
    };
    process.store["rmSync"] = rmSync;

    await githubFile.login({ privateKey });
    await githubBranch.login({ privateKey });
    const branchName = process.store.sessionId;
    if (!(await githubBranch.isExisting({ branchName }))) {
        const isCreated = await githubBranch.create({ branchName });
        if (!isCreated) {
            return reject(`failed to create branch ${branchName}`);
        }
    }
    for (const prop of Object.keys(process.store)) {
        module.exports[prop] = process.store[prop];
    }
})();