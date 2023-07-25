import { GithubBranch } from '../../../lib/registry.mjs';
describe('when-activating-github-branch', () => {
    let githubBranch;
    beforeAll(async () => {
        githubBranch = new GithubBranch({ branchName: 'tests', storeAuthToken: process.env.GIT });
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