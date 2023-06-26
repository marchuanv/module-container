const path = require('path');
const githubBranch = require('./github-branch');
const githubFile = require('./github-file');
const privateKey = process.env.GIT;
const store = { sessionId: null, name: '%root%', isDirectory: false, isFile: false, extension: null, children: [] };
const session = {};

const existsSync = async (filePath) => {
    if (!store[filePath]) {
        return false;
    }
    const fileName = path.basename(filePath);
    const isExisting = await githubFile.isExisting({ branchName: store.sessionId, fileName });
    return found.length === 0 && !isExisting;
}
session["existsSync"] = existsSync;

const mkdirSync = async (dirPath) => {
    if ((await existsSync(dirPath))) {
        throw new Error(`${dirPath} already exist.`)
    }
    store[dirPath] = null;
}
session["mkdirSync"] = mkdirSync;

const writeFileSync = async (filePath, data) => {
    const fileName = path.basename(filePath);
    await githubFile.ensureFileContent({ branchName: store.sessionId, fileName, content: data });
    store[filePath] = data;
}
session["writeFileSync"] = writeFileSync;

const readFileSync = async (filePath) => {
    if (store[filePath]) {
        return store[filePath];
    }
    const fileName = path.basename(filePath);
    const script = await githubFile.getFileContent({ branchName: store.sessionId, fileName });
    if (script) {
        store[filePath] = script;
        return;
    }
    throw new Error(`${filePath} does not exist.`)
}
session["readFileSync"] = readFileSync;

const rmSync = async (filePath) => {
    const fileName = path.basename(filePath);
    await githubFile.deleteFile({ branchName: store.sessionId, fileName });
    store[filePath] = undefined;
};
session["rmSync"] = rmSync;

module.exports = {
    createSession: async ({ sessionId }) => {
        await githubFile.login({ privateKey });
        await githubBranch.login({ privateKey });
        const branchName = sessionId;
        if (!(await githubBranch.isExisting({ branchName }))) {
            const isCreated = await githubBranch.create({ branchName });
            if (!isCreated) {
                throw new Error(`failed to create session ${sessionId}`);
            }
        }
        store.sessionId = sessionId;
        return {
            session
        };
    }
};