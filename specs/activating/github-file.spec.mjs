import {
    GithubFile,
    Github,
    Logging
} from '../../lib/index.mjs';
import utils from 'utils'
describe('when-activating-github-file', () => {
    const references = new WeakMap();
    beforeAll(() => {
        const github = new Github();
        const logging = new Logging();
        const githubFile = new GithubFile({ logging, github, utils });
        references.set(references, { githubFile });
    });
    it('should create an instance', () => {
        const { githubFile } = references.get(references);
        expect(githubFile).toBeInstanceOf(GithubFile);
    });
});