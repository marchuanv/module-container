import { Container, Logging } from '../../lib/registry.mjs'
export class GithubFake extends Container {
    constructor({ auth }) {
        super({
            logging: {
                Logging,
                ctorArgs: { logLevel: 'error' }
            },
            octokit: new Octokit({ auth })
        });
    }
    async request() {
        return {

        }
    }
}
