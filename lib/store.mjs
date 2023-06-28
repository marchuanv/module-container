const members = new WeakMap();
export class Store {
    privateKey = process.env.GIT;
    constructor({ githubBranch, githubFile, utils, logging, path }) {
        const session = {
            sessionId: utils.generateGUID(),
        };
        members.set(this, { githubBranch, githubFile, utils, logging, session, path });
    }
    async login({ privateKey }) {
        const { githubFile, session, githubBranch } = members.get(this);
        githubFile.login({ privateKey });
        githubBranch.login({ privateKey });
        const branchName = session.sessionId;
        if ((await githubBranch.isExisting({ branchName }))) {
            return true;
        } else {
            return await githubBranch.create({ branchName });
        }
    }
    async exists(filePath) {
        const { githubFile, session, path } = members.get(this);
        const fileName = path.basename(filePath);
        if (session[fileName]) {
            return true;
        } else {
            return await githubFile.isExisting({ branchName: session.sessionId, fileName });

        }
    }
    async writeFileSync(filePath, data) {
        const { githubFile, session, path } = members.get(this);
        const fileName = path.basename(filePath);
        await githubFile.ensureFileContent({ branchName: session.sessionId, fileName, content: data });
        session[fileName] = data;
    }
    async readFileSync(filePath) {
        const { githubFile, session, path } = members.get(this);
        const fileName = path.basename(filePath);
        if (session[fileName]) {
            return session[fileName];
        }
        const script = await githubFile.getFileContent({ branchName: session.sessionId, fileName });
        if (script) {
            session[fileName] = script;
            return script;
        }
        throw new Error(`${fileName} does not exist.`);
    }
    async rmSync(filePath) {
        const { githubFile, session, path } = members.get(this);
        const fileName = path.basename(filePath);
        await githubFile.deleteFile({ branchName: session.sessionId, fileName });
        delete session[fileName];
    }
}