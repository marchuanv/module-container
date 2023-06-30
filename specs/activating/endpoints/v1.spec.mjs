import {
    Logging,
    Store,
    GithubBranch,
    Github,
    GithubFile,
    EndpointRegistry,
    v1
} from '../../../lib/index.mjs';
import path from 'node:path'
import utils from 'utils'
import vm from 'node:v8'
describe('when-activating-v1-endpoint', () => {
    const references = new WeakMap();
    beforeAll(() => {
        const logging = new Logging();
        const github = new Github();
        const githubBranch = new GithubBranch({ logging, github });
        const githubFile = new GithubFile({ utils, logging, github });
        const store = new Store({ githubBranch, githubFile, utils, logging, path });
        const registry = new EndpointRegistry({ path, utils, store, logging, vm });
        const _v1 = new v1({ utils, logging, registry });
        references.set(references, { _v1 });
    });
    it('should create an instance', () => {
        const { _v1 } = references.get(references);
        expect(_v1).toBeInstanceOf(v1);
    });
});