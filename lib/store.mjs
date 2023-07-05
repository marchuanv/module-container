import { Container, Logging, GithubBranch, GithubFile, Octokit } from "./registry.mjs";
let session = { sessionId: null };
export class Store extends Container {
    constructor() {
        super();
        this.register({ Class: Logging });
        this.register({ Class: GithubBranch });
        this.register({ Class: GithubFile });
        this.register({ Class: Octokit, ref: 'octokit', args: { auth: process.env.GIT } });
    }
    async login() {
        this.octokit.auth();
        session.sessionId = this.utils.generateGUID();
        const branchName = session.sessionId;
        if ((await this.githubBranch.exists({ branchName }))) {
            return true;
        } else {
            return await this.githubBranch.create({ branchName });
        }
    }
    async logout() {
        const branchName = session.sessionId;
        session.sessionId = null;
        if ((await this.githubBranch.exists({ branchName }))) {
            await this.githubBranch.delete({ branchName });
        }
    }
    async exists({ filePath }) {
        if (session.sessionId) {
            const fileName = this.path.basename(filePath);
            return await this.githubFile.exists({ branchName: session.sessionId, fileName });
        }
        this.logging.log({ error: new Error('session was not created, call login first.') });
        return false;
    }
    async write({ filePath, data }) {
        if (session.sessionId) {
            const fileName = this.path.basename(filePath);
            return await this.githubFile.ensureContent({ branchName: session.sessionId, fileName, content: data });
        }
        this.logging.log({ error: new Error('session was not created, call login first.') });
        return false;
    }
    async read({ filePath }) {
        if (session.sessionId) {
            const fileName = this.path.basename(filePath);
            return await this.githubFile.getContent({ branchName: session.sessionId, fileName });
        }
        this.logging.log({ error: new Error('session was not created, call login first.') });
        return null;
    }
    async remove({ filePath }) {
        if (session.sessionId) {
            const fileName = this.path.basename(filePath);
            return await this.githubFile.delete({ branchName: session.sessionId, fileName });
        }
        this.logging.log({ error: new Error('session was not created, call login first.') });
        return false;
    }
}