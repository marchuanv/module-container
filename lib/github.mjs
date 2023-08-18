import utils from 'utils';
import { Container } from './registry.mjs'
import { Octokit } from 'octokit';
export class Github extends Container {
    constructor({ auth }) {
        super({
            root: {
                container: {
                    members: {
                        promises: {
                            value: []
                        },
                        octokit: {
                            class: { Octokit },
                            args: { auth }
                        }
                    },
                    behaviour: {
                        singleton: true,
                        errorHalt: true
                    },
                    mocks: {}
                }
            }
        });
    }
    request({ route, parameters }) {
        return new Promise(async (resolve, reject) => {
            const id = utils.generateGUID();
            const promises = await this.promises;
            promises.push({ id, resolve, reject, route, parameters });
            if (promises.length > 1) {
                for (const promise of promises) {
                    try {
                        const output = await request(promise);
                        await promise.resolve(output);
                    } catch (error) {
                        await promise.reject(error);
                    }
                }
            } else {
                try {
                    const octokit = await this.octokit;
                    resolve((await octokit.request(route, parameters)));
                } catch (error) {
                    await promise.reject(error);
                }
            }
        });
    }
}
