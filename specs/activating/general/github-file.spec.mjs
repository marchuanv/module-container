import {
    GithubFile,
    Github,
    Logging,
    Container
} from '../../../lib/index.mjs';
import utils from 'utils'
describe('when-activating-github-file', () => {
    const container = new Container();
    beforeAll(() => {
        container.register(Github);
        container.register(Logging);
        container.register(GithubFile);
    });
    it('should create an instance', () => {
        const { instance } = container.get('$githubFile');
        expect(instance).toBeInstanceOf(GithubFile);
    });
});