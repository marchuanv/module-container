import {
    GithubBranch,
    Github,
    Logging
} from '../../lib/index.mjs';
describe('when-activating-github-branch', () => {
    const references = new WeakMap();
    beforeAll(() => {
        const github = new Github();
        const logging = new Logging();
        const githubBranch = new GithubBranch({ logging, github });
        references.set(references, { githubBranch });
    });
    it('should create an instance', () => {
        const { githubBranch } = references.get(references);
        expect(githubBranch).toBeInstanceOf(GithubBranch);
    });
});