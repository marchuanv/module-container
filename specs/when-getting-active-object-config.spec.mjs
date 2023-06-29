import {
    GetConfig,
    Logging,
    EndpointRegistry,
    Store,
    GithubBranch,
    Github,
    GithubFile
} from '../lib/index.mjs';
import utils from 'utils'
import path from 'node:path'
describe('when-getting-active-object-config', function () {
    const references = new WeakMap();
    beforeAll(() => {
        const logging = new Logging();
        const github = new Github();
        const githubBranch = new GithubBranch({ logging, github });
        const githubFile = new GithubFile({ utils, logging, github });
        const store = new Store({ githubBranch, githubFile, utils, logging, path });
        const getConfig = new GetConfig({ utils, store });
        references.set(this, { getConfig });
    });
    it('should add two numbers', () => {
        expect(1).toBe(0);
    });
});