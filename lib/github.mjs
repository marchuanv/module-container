import { Container, Logging } from './registry.mjs'
import { Octokit } from 'octokit';
export class Github extends Container {
    constructor({ auth }) {
        super({
            logging: {
                Logging,
                ctorArgs: { logLevel: 'error' }
            },
            octokit: new Octokit({ auth })
        });
    }
    async request({ route, parameters }) {
        return await this.octokit.request(route, parameters);
    }
}
