import utils from 'utils';
import { Container, Logging } from '../../lib/registry.mjs'
export class GithubFake extends Container {
    constructor({ }) {
        super({
            logging: {
                Logging,
                ctorArgs: { logLevel: 'error' }
            },
            data: new Map(),
            heads: new Map(),
            branches: new Map(),
            locked: false
        });
    }
    request({ route, parameters }) {
        return new Promise(async (resolve, reject) => {
            if (this.locked) {
                setTimeout(async () => {
                    resolve((await request({ route, parameters })));
                }, 1000);
            } else {
                this.locked = true;
                this.heads.delete('heads');
                this.heads.set('heads', { data: [{ object: { sha: 12345678 } }] });
                let isBranch = /\/branch/g.test(route);
                let isBranchRef = /git\/refs\/heads/g.test(route);
                if (!isBranchRef) {
                    isBranchRef = /\/git\/refs/g.test(route);
                }
                let fileMatches = /[a-zA-Z0-9\-]+\.((json)|(js))/g.exec(route);
                if (route.indexOf('GET /repos') > -1) {
                    if (isBranch) {
                        let branch = this.branches.get('testing');
                        if (branch) {
                            return resolve(true);
                        } else {
                            this.locked = false;
                            return reject(new Error('branch does not exist'));
                        }
                    }
                    if (isBranchRef) {
                        return resolve(this.heads.get('heads'));
                    }
                    if (fileMatches.length > 0) {
                        const id = fileMatches[0];
                        let data = this.data.get(id);
                        if (data) {
                            data = utils.base64ToString(data);
                        }
                        return resolve({ data });
                    }
                }
                if (route.indexOf('PUT /repos') > -1) {
                    if (fileMatches.length > 0) {
                        const id = fileMatches[0];
                        this.data.delete(id);
                        this.data.set(id, parameters.content);
                        return resolve();
                    }
                }
                if (route.indexOf('POST /repos') > -1) {
                    if (isBranchRef) {
                        const id = 'testing';
                        this.branches.delete(id);
                        this.branches.set(id, 'testing');
                        return resolve();
                    }
                }
                this.locked = false;
                return reject(new Error('Not Implemented'));
            }
        });
    }
}
