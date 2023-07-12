import utils from 'utils';
import { Container, Logging } from '../../lib/registry.mjs'
const octokit = {
    refs: new Map(),
    branches: new Map(),
    files: new Map(),
};
octokit.refs.set('heads', { data: [{ object: { sha: 12345678 } }] })
export class GithubFake extends Container {
    constructor({ }) {
        super({
            logging: {
                Logging,
                ctorArgs: { logLevel: 'error' }
            },
            locked: false
        });
    }
    request({ route, parameters }) {
        return new Promise(async (resolve, reject) => {
            if (this.locked) {
                setTimeout(async () => {
                    try {
                        const output = await this.request({ route, parameters });
                        resolve(output);
                    } catch (err) {
                        reject(err);
                    }
                }, 1000);
            } else {
                try {
                    this.locked = true;
                    let isBranch = /\/branch/g.test(route);
                    let isBranchRef = /git\/refs\/heads/g.test(route);
                    if (!isBranchRef) {
                        isBranchRef = /\/git\/refs/g.test(route);
                    }
                    let fileMatches = /[a-zA-Z0-9\-]+\.((json)|(js))/g.exec(route);
                    if (route.indexOf('GET /repos') > -1) {
                        if (isBranch) {
                            let branch = octokit.branches.get('testing');
                            if (branch) {
                                return resolve(true);
                            } else {
                                return reject(new Error('branch does not exist'));
                            }
                        }
                        if (isBranchRef) {
                            return resolve(octokit.refs.get('heads'));
                        }
                        if (fileMatches.length > 0) {
                            const id = fileMatches[0];
                            let file = octokit.files.get(id);
                            if (file) {
                                file = utils.base64ToString(file);
                            }
                            return resolve({ data: { content: file } });
                        }
                    }
                    if (route.indexOf('PUT /repos') > -1) {
                        if (fileMatches.length > 0) {
                            const id = fileMatches[0];
                            octokit.files.set(id, parameters.content);
                            return resolve();
                        }
                    }
                    if (route.indexOf('POST /repos') > -1) {
                        if (isBranchRef) {
                            const id = 'testing';
                            octokit.branches.set(id, 'testing');
                            return resolve();
                        }
                    }

                    return reject(new Error('Not Implemented'));
                }
                catch (err) {
                    reject(err);
                }
                finally {
                    this.locked = false;
                }
            }
        });
    }
}
