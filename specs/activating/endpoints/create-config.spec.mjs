import {
    Logging,
    Store,
    GithubBranch,
    Github,
    GithubFile,
    CreateConfig
} from '../../../lib/index.mjs';
import path from 'node:path'
import utils from 'utils'
describe('when-activating-create-config-endpoint', () => {
    const references = new WeakMap();
    beforeAll(() => {
        const logging = new Logging();
        const github = new Github();
        const githubBranch = new GithubBranch({ logging, github });
        const githubFile = new GithubFile({ utils, logging, github });
        const store = new Store({ githubBranch, githubFile, utils, logging, path });
        const createConfig = new CreateConfig({ utils, store });
        references.set(references, { createConfig });
    });
    it('should create an instance', () => {
        const { createConfig } = references.get(references);
        expect(createConfig).toBeInstanceOf(CreateConfig);
    });
});