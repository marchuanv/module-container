import { Container, GithubBranch, GithubFile } from './registry.mjs'
import path from 'node:path'
export class Store extends Container {
    constructor({ branchName, filePath, token }) {
        super({
            githubBranch: {
                GithubBranch,
                ctorArgs: { branchName, fileName }
            },
            githubFile: {
                GithubFile,
                ctorArgs: { branchName, fileName, token }
            },
            branchName,
            fileName: path.basename(filePath),
            createBranch: async () => {
                if ((!await this.githubBranch.exists())) {
                    await this.githubBranch.create();
                }
            }
        });
    }
    async exists() {
        return await this.githubFile.exists();
    }
    async write({ content }) {
        return await this.githubFile.ensureContent({ content });
    }
    async read() {
        return await this.githubFile.getContent();
    }
    async remove() {
        return await this.githubFile.delete();
    }
}