import { Container, GithubBranch, GithubFile } from './registry.mjs'
import path from 'node:path'
export class Store extends Container {
    constructor({ branchName, filePath, token }) {
        super();
        const fileName = path.basename(filePath);
        this.dependency({
            githubBranch: {
                GithubBranch,
                ctorArgs: { branchName, fileName }
            },
            githubFile: {
                GithubFile,
                ctorArgs: { branchName, fileName, token }
            },
            branchName,
            fileName
        });
        this.dependency(async () => {
            if ((!await this.githubBranch.exists())) {
                await this.githubBranch.create();
            }
        });
    }
    async exists() {
        return await this.githubFile.exists({ branchName: this.branchName, fileName: this.fileName });
    }
    async write({ content }) {
        return await this.githubFile.ensureContent({ branchName: this.branchName, fileName: this.fileName, content });
    }
    async read() {
        return await this.githubFile.getContent({ branchName: this.branchName, fileName: this.fileName });
    }
    async remove() {
        return await this.githubFile.delete({ branchName: this.branchName, fileName: this.fileName });
    }
}