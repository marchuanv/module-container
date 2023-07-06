import { Container } from './registry.mjs'
import { Octokit } from 'octokit';
export class Github extends Container {
    constructor({ auth }) {
        super();
        const octokit = new Octokit({ auth });
        this.dependency({ octokit });
    }
    async request({ route, parameters }) {
        const test = await this.octokit.request(route, parameters);
        return test;
    }
}
