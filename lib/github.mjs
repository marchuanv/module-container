import { Container } from './registry.mjs'
import { Octokit } from 'octokit';
export class Github extends Container {
    constructor({ auth }) {
        super();
        const octokit = new Octokit({ auth });
        this.dependency({ octokit });
    }
    async request({ path, options }) {
        return this.octokit.request(path, options);
    }
}
