import { Container, GithubBranch, GithubFile } from './registry.mjs'
import path from 'node:path'
import utils from 'utils';
export class Store extends Container {
    constructor({ branchName, filePath, token }) {
        super({
            githubBranch: {
                type: { GithubBranch },
                args: { branchName, fileName: path.basename(filePath) }
            },
            githubFile: {
                type: { GithubFile },
                args: { branchName, fileName: path.basename(filePath), token }
            },
            branchName: {
                name: 'branchName',
                value: branchName
            },
            fileName: {
                name: 'fileName',
                value: path.basename(filePath)
            },
            createBranch: {
                callback: {
                    func: async () => {
                        const githubBranch = await this.githubBranch;
                        if ((!await githubBranch.exists())) {
                            await githubBranch.create();
                        }
                    }
                },
                args: {}
            },
            utils: {
                name: 'utils',
                value: utils
            }
        });
    }
    async exists() {
        const githubFile = await this.githubFile;
        return await githubFile.exists();
    }
    async write({ content }) {

        const githubFile = await this.githubFile;
        const utils = await this.utils;

        const _content = utils.stringToBase64(content);
        return await githubFile.ensureContent({ content: _content });
    }
    async read() {

        const githubFile = await this.githubFile;
        const utils = await this.utils;

        let content = await githubFile.getContent();
        return utils.base64ToString(content);
    }
    async remove() {
        const githubFile = await this.githubFile;
        return await githubFile.delete();
    }
}