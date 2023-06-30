import {
    GithubBranch,
    GithubFile,
    Github,
    Logging,
    Store
} from '../../lib/index.mjs';
import utils from 'utils'
describe('when-activating-store', () => {
    const references = new WeakMap();
    beforeAll(() => {
        const github = new Github();
        const logging = new Logging();
        const githubBranch = new GithubBranch({ logging, github });
        const githubFile = new GithubFile({ utils, logging, github });
        const store = new Store({ githubBranch, githubFile, utils, logging });
        references.set(references, { store });
    });
    it('should create an instance', () => {
        const { store } = references.get(references);
        expect(store).toBeInstanceOf(Store);
    });
});