import {
    Logging,
    Store,
    GithubBranch,
    Github,
    GithubFile,
    GetClass
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
        const getClass = new GetClass({ utils, store });
        references.set(references, { getClass });
    });
    it('should create an instace', () => {
        const { getClass } = references.get(references);
        expect(getClass).toBeInstanceOf(GetClass)
    });
});