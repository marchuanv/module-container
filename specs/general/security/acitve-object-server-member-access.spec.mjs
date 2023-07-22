import { ActiveObjectServer, GithubFake } from '../../../lib/registry.mjs';
describe('when-accessing-server-member-from-different-context', () => {
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
        expect(error.message).toContain(`'server' member is private for context ActiveObjectServer`);
    });
});
describe('when-accessing-github-fake-member-from-different-context', () => {
    let error;
    beforeAll(async () => {
        const github = new GithubFake({ auth: process.env.GIT });
        expect(github).toBeDefined();
        expect(github).toBeInstanceOf(GithubFake);
        try {
            await github.octokit;
        } catch (err) {
            error = err;
        }
    });
    it('should return security error', () => {
        expect(error).toBeDefined();
        expect(error.message).toContain(`'octokit' member is private for context GithubFake`);
    });
});