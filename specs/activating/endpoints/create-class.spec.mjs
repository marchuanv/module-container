import {
    Logging,
    Store,
    GithubBranch,
    Github,
    GithubFile,
    CreateClass
} from '../../../lib/index.mjs';
import path from 'node:path'
import utils from 'utils'
import vm from 'node:v8'
describe('when-activating-create-class-endpoint', () => {
    const references = new WeakMap();
    beforeAll(() => {
        const logging = new Logging();
        const github = new Github();
        const githubBranch = new GithubBranch({ logging, github });
        const githubFile = new GithubFile({ utils, logging, github });
        const store = new Store({ githubBranch, githubFile, utils, logging, path });
        const createClass = new CreateClass({ utils, vm, store });
        references.set(references, { createClass });
    });
    it('should create an instance', () => {
        const { createClass } = references.get(references);
        expect(createClass).toBeInstanceOf(CreateClass);
    });
});