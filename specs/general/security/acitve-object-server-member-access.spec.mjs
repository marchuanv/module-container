import { ActiveObjectServer, GithubMock } from '../../../lib/registry.mjs';
for(let i = 0; i < 10; i++) {
    describe('when accessing a private member of the ActiveObjectServer class given a different context', () => {
        let error;
        let returnValue;
        beforeAll(async () => {
            const oas = new ActiveObjectServer();
            expect(oas).toBeDefined();
            expect(oas).toBeInstanceOf(ActiveObjectServer);
            try {
                returnValue = await oas.server;
            } catch (err) {
                error = err;
            }
        });
        it('should return a security error', () => {
            expect(returnValue).not.toBeDefined();
            expect(error).toBeDefined();
            expect(error.message).toContain(`'server' member is private for context`);
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
        it('should NOT return any errors', () => {
            expect(error).not.toBeDefined();
        });
        it('should return undefined as outpot from the member', () => {
            expect(returnValue).not.toBeDefined();
        });
    });
}
