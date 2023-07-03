import { Container } from "./registry.mjs";
let session = { sessionId: null };
export class Store {
    async login() {
        const { $utils, $githubBranch, $octokitWithDefaults } = new Container();
        $octokitWithDefaults.auth();
        session.sessionId = $utils.generateGUID();
        const branchName = session.sessionId;
        if ((await $githubBranch.exists({ branchName }))) {
            return true;
        } else {
            return await $githubBranch.create({ branchName });
        }
    }
    async logout() {
        const container = new Container();
        const {
            $store,
            $githubBranch,
            $githubFile,
            $octokitWithDefaults
        } = container;
        const branchName = session.sessionId;
        session.sessionId = null;
        if ((await $githubBranch.exists({ branchName }))) {
            await $githubBranch.delete({ branchName });
        }
        $store.collect();
        $githubBranch.collect();
        $octokitWithDefaults.collect();
        $githubFile.collect();
    }
    async exists({ filePath }) {
        const { $logging, $path, $githubFile } = new Container();
        if (session.sessionId) {
            const fileName = $path.basename(filePath);
            return await $githubFile.exists({ branchName: session.sessionId, fileName });
        }
        $logging.log({ error: new Error('session was not created, call login first.') });
        return false;
    }
    async write({ filePath, data }) {
        const { $logging, $path, $githubFile } = new Container();
        if (session.sessionId) {
            const fileName = $path.basename(filePath);
            return await $githubFile.ensureContent({ branchName: session.sessionId, fileName, content: data });
        }
        $logging.log({ error: new Error('session was not created, call login first.') });
        return false;
    }
    async read({ filePath }) {
        const { $logging, $path, $githubFile } = new Container();
        if (session.sessionId) {
            const fileName = $path.basename(filePath);
            return await $githubFile.getContent({ branchName: session.sessionId, fileName });
        }
        $logging.log({ error: new Error('session was not created, call login first.') });
        return null;
    }
    async remove({ filePath }) {
        const { $logging, $path, $githubFile } = new Container();
        if (session.sessionId) {
            const fileName = $path.basename(filePath);
            return await $githubFile.delete({ branchName: session.sessionId, fileName });
        }
        $logging.log({ error: new Error('session was not created, call login first.') });
        return false;
    }
}