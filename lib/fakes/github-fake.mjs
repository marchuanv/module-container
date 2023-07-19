import { Container } from '../registry.mjs'
export class GithubFake extends Container {
    constructor({ }) {
        super({
            octokit: {
                name: 'octokit',
                value: {
                    refs: new Map(),
                    branches: new Map(),
                    files: new Map(),
                    locked: false
                }
            },
            setup: {
                args: {},
                callback: {
                    func: async () => {
                        this.octokit.refs.set('heads', { data: [{ object: { sha: 12345678 } }] })
                    }
                }
            },
            behaviour: {
                singleton: true,
                errors: {
                    func: [],
                    return: false
                }
            }
        });
    }
    request({ route, parameters }) {
        return new Promise(async (resolve, reject) => {
            this.octokit.locked = true;
            let isBranch = /\/branch/g.test(route);
            let isBranchRef = /git\/refs\/heads/g.test(route);
            if (!isBranchRef) {
                isBranchRef = /\/git\/refs/g.test(route);
            }
            let fileMatches = /[a-zA-Z0-9\-]+\.((json)|(js))/g.exec(route);
            if (route.indexOf('GET /repos') > -1) {
                if (isBranch) {
                    let branch = this.octokit.branches.get('testing');
                    if (branch) {
                        return setTimeout(() => {
                            resolve(true);
                        }, 100);
                    } else {
                        return reject(new Error('branch does not exist'));
                    }
                }
                if (isBranchRef) {
                    return setTimeout(() => {
                        const data = this.octokit.refs.get('heads');
                        resolve(data);
                    }, 100);
                }
                if (fileMatches.length > 0) {
                    const id = fileMatches[0];
                    let file = this.octokit.files.get(id);
                    if (file) {
                        return setTimeout(() => {
                            return resolve({ data: { content: file } });
                        }, 100);
                    } else {
                        return setTimeout(() => {
                            return resolve({ data: null });
                        }, 100);
                    }
                }
            }
            if (route.indexOf('PUT /repos') > -1) {
                if (fileMatches.length > 0) {
                    const id = fileMatches[0];
                    this.octokit.files.set(id, parameters.content);
                    return setTimeout(resolve, 100);
                }
            }
            if (route.indexOf('POST /repos') > -1) {
                if (isBranchRef) {
                    const id = 'testing';
                    this.octokit.branches.set(id, 'testing');
                    return setTimeout(resolve, 100);
                }
            }
            if (route.indexOf('DELETE /repos') > -1) {
                if (fileMatches.length > 0) {
                    const id = fileMatches[0];
                    if (this.octokit.files.has(id)) {
                        this.octokit.files.delete(id);
                        return setTimeout(resolve, 100);
                    } else {
                        reject(new Error('file does not exist'));
                    }
                }
            }
            return reject(new Error('Not Implemented'));
        });
    }
}
