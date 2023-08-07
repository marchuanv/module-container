import utils from 'utils';
import { Container } from '../registry.mjs'
export class GithubMock extends Container {
    constructor({ }) {
        super({
            root: {
                container: {
                    members: {
                        octokit: {
                            value: {
                                refs: new Map(),
                                branches: new Map(),
                                content: new Map(),
                                Id: utils.generateGUID()
                            }
                        },
                        setup: {
                            args: {},
                            callback:  async () => {
                                const octokit = await this.octokit;
                                octokit.refs.set('heads', {
                                    data: [{
                                        object: { sha: 12345678 }
                                    }]
                                });
                            }
                        },
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
            const octokit = await this.octokit;
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
                        return setTimeout(() => {
                            resolve(true);
                        }, 100);
                    } else {
                        return reject(new Error('branch does not exist'));
                    }
                }
                if (isBranchRef) {
                    return setTimeout(() => {
                        const data = octokit.refs.get('heads');
                        resolve(data);
                    }, 100);
                }
                if (fileMatches.length > 0) {
                    const id = fileMatches[0];
                    let content = octokit.content.get(id);
                    if (content) {
                        return setTimeout(() => {
                            return resolve({ data: { content } });
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
                    octokit.content.set(id, parameters.content);
                    return setTimeout(resolve, 100);
                }
            }
            if (route.indexOf('POST /repos') > -1) {
                if (isBranchRef) {
                    const id = 'testing';
                    octokit.branches.set(id, 'testing');
                    return setTimeout(resolve, 100);
                }
            }
            if (route.indexOf('DELETE /repos') > -1) {
                if (fileMatches.length > 0) {
                    const id = fileMatches[0];
                    if (octokit.content.has(id)) {
                        octokit.content.delete(id);
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
