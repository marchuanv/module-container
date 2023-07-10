import {
    Github,
    GithubBranch,
} from '../../../lib/registry.mjs';
import { GithubFake } from '../../fakes/registry.mjs';
describe('when-activating-github-branch', () => {
    let githubBranch;
    beforeAll(() => {
        githubBranch = new GithubBranch({ branchName: 'tests', token: process.env.GIT });
        githubBranch.mock({ Class: Github, FakeClass: GithubFake });
    });
    it('should create an instance', () => {
        expect(githubBranch).toBeDefined();
    });
    it('should have a create member', () => {
        expect(githubBranch.create).toBeDefined();
    });
    it('should have a delete member', () => {
        expect(githubBranch.delete).toBeDefined();
    });
    it('should have an exists member', () => {
        expect(githubBranch.exists).toBeDefined();
    });
});