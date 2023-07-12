import { Container, GithubBranch, GithubFile } from './registry.mjs'
import path from 'node:path'
import utils from 'utils';
export class Store extends Container {
    constructor({ branchName, filePath, token }) {
        super({
            githubBranch: {
                GithubBranch,
                ctorArgs: { branchName, fileName: path.basename(filePath) }
            },
            githubFile: {
                GithubFile,
                ctorArgs: { branchName, fileName: path.basename(filePath), token }
            },
            branchName,
            fileName: path.basename(filePath),
            createBranch: async () => {
                if ((!await this.githubBranch.exists())) {
                    await this.githubBranch.create();
                }
            },
            utils
        });
    }
    async exists() {
        return await this.githubFile.exists();
    }
    async write({ content }) {
        const _content = this.utils.stringToBase64(content);
        return await this.githubFile.ensureContent({ content: _content });
    }
    async read() {
        let content = await this.githubFile.getContent();
        return this.utils.base64ToString(content);
    }
    async remove() {
        return await this.githubFile.delete();
    }
}