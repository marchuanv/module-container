import { Container } from './registry.mjs'
import { Octokit } from 'octokit';
export class Github extends Container {
    constructor({ auth }) {
        super({
            octokit: {
                type: { Octokit },
                args: { auth }
            },
            locked: {
                name: 'locked',
                value: false
            }
        });
    }
    request({ route, parameters }) {
        return new Promise(async (resolve) => {
            if (this.locked) {
                setTimeout(async () => {
                    resolve((await request({ route, parameters })));
                }, 1000);
            } else {
                resolve((await this.octokit.request(route, parameters)));
            }
        });
    }
}
