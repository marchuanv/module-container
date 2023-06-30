import {
    GithubBranch,
    GithubFile,
    Github,
    Logging,
    Store,
    Container
} from '../../../lib/index.mjs';
import utils from 'utils'
describe('when-activating-store', () => {
    const container = new Container();
    beforeAll(() => {
        container.register(Github);
        container.register(Logging);
        container.register(GithubBranch);
        container.register(GithubFile);
        container.register(Store);
    });
    it('should create an instance', () => {
        const { instance } = container.get('$store');
        expect(instance).toBeInstanceOf(Store);
    });
});