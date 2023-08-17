import { ActiveObjectServer, GithubMock } from '../lib/registry.mjs';
for (let i = 0; i < 2; i++) {
    describe('when accessing a private member of the ActiveObjectServer class given a different context', () => {
        let error;
        let returnValue;
        beforeAll(async () => {
            const oas = new ActiveObjectServer();
            expect(oas).toBeDefined();
            expect(oas).toBeInstanceOf(ActiveObjectServer);
            try {
                await oas.stop();
                returnValue = await oas.server;
            } catch (err) {
                error = err;
            }
        });
        it('should return a security error', () => {
            expect(returnValue).not.toBeDefined();
            expect(error).toBeDefined();
            expect(error.message).toBe('server member is private for ActiveObjectServer');
        });
    });
    describe('when accessing a private member of the GithubMock class from a different context given that the class is configured as a singleton', () => {
        let error;
        let returnValue;
        beforeAll(async () => {
            const github = new GithubMock({ auth: process.env.GIT });
            expect(github).toBeDefined();
            expect(github).toBeInstanceOf(GithubMock);
            try {
                returnValue = await github.octokit;
            } catch (err) {
                error = err;
            }
        });
        it('should return a security error', () => {
            expect(error).toBeDefined();
            expect(error.message).toContain(`octokit member is private for GithubMock`);
        });
        it('should return undefined as output from the member', () => {
            expect(returnValue).not.toBeDefined();
        });
    });
}
