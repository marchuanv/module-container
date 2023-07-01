import { Container } from "./container.mjs";
let session = { sessionId: null };
export class Store extends Container {
    async login() {
      
        $githubFile.login({ privateKey });
        $githubBranch.login({ privateKey });
        session.sessionId =  $utils.generateGUID();
        const branchName = session.sessionId;
        if ((await $githubBranch.isExisting({ branchName }))) {
            return true;
        } else {
            return await $githubBranch.create({ branchName });
        }
    }
    async exists(filePath) {
        const fileName = $path.basename(filePath);
        if (session[fileName]) {
            return true;
        } else {
            return await $githubFile.isExisting({ branchName: session.sessionId, fileName });

        }
    }
    async writeFile(filePath, data) {
        const fileName = $path.basename(filePath);
        await $githubFile.ensureFileContent({ branchName: session.sessionId, fileName, content: data });
        session[fileName] = data;
    }
    async readFile(filePath) {
        const fileName = $path.basename(filePath);
        if (session[fileName]) {
            return session[fileName];
        }
        const script = await $githubFile.getFileContent({ branchName: session.sessionId, fileName });
        if (script) {
            session[fileName] = script;
            return script;
        }
        throw new Error(`${fileName} does not exist.`);
    }
    async removeFile(filePath) {
        const fileName = $path.basename(filePath);
        await $githubFile.deleteFile({ branchName: session.sessionId, fileName });
        delete session[fileName];
    }
}