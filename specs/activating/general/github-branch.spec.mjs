import {
    GithubBranch,
    Github,
    Logging,
    Container
} from '../../../lib/index.mjs';
describe('when-activating-github-branch', () => {
    const container = new Container();
    beforeAll(() => {
        container.register(Github);
        container.register(Logging);
        container.register(GithubBranch);
    });
    it('should create an instance', () => {
        const { instance } = container.get('$githubBranch');
        expect(instance).toBeInstanceOf(GithubBranch);
    });
});