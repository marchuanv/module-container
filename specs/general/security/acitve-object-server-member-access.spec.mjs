import { ActiveObjectServer, GithubMock } from '../../../lib/registry.mjs';
describe('when-accessing-server-member-from-a-different-context', () => {
    let error;
    beforeAll(async () => {
        const oas = new ActiveObjectServer();
        expect(oas).toBeDefined();
        expect(oas).toBeInstanceOf(ActiveObjectServer);
        try {
            await oas.server;
        } catch (err) {
            error = err;
        }
    });
    it('should return security error', () => {
        expect(error).toBeDefined();
        expect(error.message).toContain(`'server' member is private for context`);
    });
});
describe('when-accessing-github-mock-member-from-a-different-context', () => {
    let error;
    beforeAll(async () => {
        const github = new GithubMock({ auth: process.env.GIT });
        expect(github).toBeDefined();
        expect(github).toBeInstanceOf(GithubMock);
        try {
            await github.octokit;
        } catch (err) {
            error = err;
        }
    });
    it('should return security error', () => {
        expect(error).toBeDefined();
        expect(error.message).toContain(`'octokit' member is private for context`);
    });
});