import {
    Logging,
    Store,
    GithubBranch,
    Github,
    GithubFile,
    EndpointRegistry
} from '../../lib/index.mjs';
import path from 'node:path'
import utils from 'utils'
import vm from 'node:v8'
describe('when-activating-endpoint-registry', () => {
    const references = new WeakMap();
    beforeAll(() => {
        const logging = new Logging();
        const github = new Github();
        const githubBranch = new GithubBranch({ logging, github });
        const githubFile = new GithubFile({ utils, logging, github });
        const store = new Store({ githubBranch, githubFile, utils, logging, path });
        const endpointRegistry = new EndpointRegistry({ path, utils, store, logging, vm });
        references.set(references, { endpointRegistry });
    });
    it('should create an instance', () => {
        const { endpointRegistry } = references.get(references);
        expect(endpointRegistry).toBeInstanceOf(EndpointRegistry);
    });
});