const path = require('path');
const githubBranch = require('./github-branch');
const githubFile = require('./github-file');
const privateKey = process.env.GIT;
process.store = { sessionId: null, name: '%root%', isDirectory: false, isFile: false, extension: null, children: [] };
const session = {};

const existsSync = async (filePath) => {
    if (process.store[filePath]) {
        return true;
    } else {
        const fileName = path.basename(filePath);
        return await githubFile.isExisting({ branchName: process.store.sessionId, fileName });
    }
}
session["existsSync"] = existsSync;

const mkdirSync = async (dirPath) => {
    if ((await existsSync(dirPath))) {
        throw new Error(`${dirPath} already exist.`)
    }
    process.store[dirPath] = null;
}
session["mkdirSync"] = mkdirSync;

const writeFileSync = async (filePath, data) => {
    const fileName = path.basename(filePath);
    await githubFile.ensureFileContent({ branchName: process.store.sessionId, fileName, content: data });
    process.store[filePath] = data;
}
session["writeFileSync"] = writeFileSync;

const readFileSync = async (filePath) => {
    if (process.store[filePath]) {
        return process.store[filePath];
    }
    const fileName = path.basename(filePath);
    const script = await githubFile.getFileContent({ branchName: process.store.sessionId, fileName });
    if (script) {
        process.store[filePath] = script;
        return script;
    }
    throw new Error(`${filePath} does not exist.`)
}
session["readFileSync"] = readFileSync;

const rmSync = async (filePath) => {
    const fileName = path.basename(filePath);
    await githubFile.deleteFile({ branchName: process.store.sessionId, fileName });
    process.store[filePath] = undefined;
};
session["rmSync"] = rmSync;

module.exports = {
    createSession: ({ sessionId }) => {
        if (!sessionId) {
            throw new Error('session id argument is null or undefined.');
        }
        if (process.store.sessionId) {
            return { session };
        }
        return new Promise(async (resolve, reject) => {
            if (process.store.lock) {
                await setTimeout(async () => {
                    if (!process.store.lock) {
                        const { session } = await module.exports.createSession({ sessionId });
                        await resolve({ session });
                    }
                }, 1000);
            } else {
                process.store.lock = true;
                await githubFile.login({ privateKey });
                await githubBranch.login({ privateKey });
                const branchName = sessionId;
                if (!(await githubBranch.isExisting({ branchName }))) {
                    const isCreated = await githubBranch.create({ branchName });
                    if (!isCreated) {
                        return reject(`failed to create session ${sessionId}`);
                    }
                }
                process.store.sessionId = sessionId;
                process.store.lock = false;
                await resolve({ session });
            }
        });
    }
};