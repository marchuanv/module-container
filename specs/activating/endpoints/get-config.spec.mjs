import {
    GetConfig,
    Logging,
    Store,
    GithubBranch,
    Github,
    GithubFile
} from '../../../lib/index.mjs';
import path from 'node:path'
import utils from 'utils'
describe('when-activating-get-config-endpoint', () => {
    const references = new WeakMap();
    beforeAll(() => {
        const logging = new Logging();
        const github = new Github();
        const githubBranch = new GithubBranch({ logging, github });
        const githubFile = new GithubFile({ utils, logging, github });
        const store = new Store({ githubBranch, githubFile, utils, logging, path });
        const getConfig = new GetConfig({ utils, store });
        references.set(references, { getConfig });
    });
    it('should create an instance', () => {
        const { getConfig } = references.get(references);
        expect(getConfig).toBeInstanceOf(GetConfig);
    });
});