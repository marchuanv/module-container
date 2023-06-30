import {
    Logging,
    Store,
    GithubBranch,
    Github,
    GithubFile,
    DeleteConfig
} from '../../../lib/index.mjs';
import path from 'node:path'
import utils from 'utils'
describe('when-activating-delete-config-endpoint', () => {
    const references = new WeakMap();
    beforeAll(() => {
        const logging = new Logging();
        const github = new Github();
        const githubBranch = new GithubBranch({ logging, github });
        const githubFile = new GithubFile({ utils, logging, github });
        const store = new Store({ githubBranch, githubFile, utils, logging, path });
        const deleteConfig = new DeleteConfig({ utils, store });
        references.set(references, { deleteConfig });
    });
    it('should create an instance', () => {
        const { deleteConfig } = references.get(references);
        expect(deleteConfig).toBeInstanceOf(DeleteConfig);
    });
});