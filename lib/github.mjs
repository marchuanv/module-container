import { Container, Logging } from './registry.mjs'
import { Octokit } from 'octokit';
export class Github extends Container {
    constructor({ auth }) {
        super();
        const octokit = new Octokit({ auth });
        this.dependency({ logging: {
            Logging,
            ctorArgs: { logLevel: 'error' }
        }, octokit });
    }
    async request({ route, parameters }) {
        return await this.octokit.request(route, parameters);
    }
}
