import { Container, GithubBranch, GithubFile } from "./registry.mjs";
export class Store extends Container {
    constructor({ branchName, filePath, token }) {
        super();
       this.dependency({ Class: GithubBranch, args: { token }});
       this.dependency({ Class: GithubFile, args: { token } });
        this.bag.branchName = branchName;
        this.bag.filePath = filePath;
        this.dependency( async () => { 
            if ((!await (await this.githubBranch).exists({ branchName }))) {
                await (await this.githubBranch).create({ branchName });
            }
        });
    }
    async exists() {
        const { branchName, filePath } = this.bag;
        const fileName = this.path.basename(filePath);
        return await (await this.githubFile).exists({ branchName, fileName });
    }
    async write({ content }) {
        const { branchName, filePath } = this.bag;
        const fileName = this.path.basename(filePath);
        return await (await this.githubFile).ensureContent({ branchName, fileName, content });
    }
    async read() {
        const { branchName, filePath } = this.bag;
        const fileName = this.path.basename(filePath);
        return await (await this.githubFile).getContent({ branchName, fileName });
    }
    async remove() {
        const { branchName, filePath } = this.bag;
        const fileName = this.path.basename(filePath);
        return await (await this.githubFile).delete({ branchName, fileName });
    }
}