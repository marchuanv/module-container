import { Container } from "./registry.mjs";
let session = { sessionId: null };
export class Store {
    async login() {
        const { $utils, $githubBranch } = new Container();
        session.sessionId = $utils.generateGUID();
        const branchName = session.sessionId;
        if ((await $githubBranch.exists({ branchName }))) {
            return true;
        } else {
            return await $githubBranch.create({ branchName });
        }
    }
    async exists({ filePath }) {
        const { $logging, $path, $githubFile } = new Container();
        if (session.sessionId) {
            const fileName = $path.basename(filePath);
            return await $githubFile.exists({ branchName: session.sessionId, fileName });
        }
        $logging.setToError();
        $logging.log({ error: new Error('session was not created, call login first.') });
    }
    async write({ filePath, data }) {
        const { $logging, $path, $githubFile } = new Container();
        if (session.sessionId) {
            const fileName = $path.basename(filePath);
            return await $githubFile.ensureContent({ branchName: session.sessionId, fileName, content: data });
        }
        $logging.setToError();
        $logging.log({ error: new Error('session was not created, call login first.') });
    }
    async read({ filePath }) {
        const { $logging, $path, $githubFile } = new Container();
        if (session.sessionId) {
            const fileName = $path.basename(filePath);
            return await $githubFile.getContent({ branchName: session.sessionId, fileName });
        }
        $logging.setToError();
        $logging.log({ error: new Error('session was not created, call login first.') });
    }
    async remove(filePath) {
        const { $logging, $path, $githubFile } = new Container();
        if (session.sessionId) {
            const fileName = $path.basename(filePath);
            return await $githubFile.delete({ branchName: session.sessionId, fileName });
        }
        $logging.setToError();
        $logging.log({ error: new Error('session was not created, call login first.') });
    }
}