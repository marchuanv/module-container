import {
    Logging,
    Store,
    GithubBranch,
    Github,
    GithubFile,
    DeleteClass
} from '../../../lib/index.mjs';
import path from 'node:path'
import utils from 'utils'
describe('when-activating-delete-class-endpoint', () => {
    const references = new WeakMap();
    beforeAll(() => {
        const logging = new Logging();
        const github = new Github();
        const githubBranch = new GithubBranch({ logging, github });
        const githubFile = new GithubFile({ utils, logging, github });
        const store = new Store({ githubBranch, githubFile, utils, logging, path });
        const deleteClass = new DeleteClass({ utils, store });
        references.set(references, { deleteClass });
    });
    it('should create an instace', () => {
        const { deleteClass } = references.get(references);
        expect(deleteClass).toBeInstanceOf(DeleteClass)
    });
});