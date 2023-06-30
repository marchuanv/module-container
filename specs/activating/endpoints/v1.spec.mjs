import {
    Logging,
    Store,
    GithubBranch,
    Github,
    GithubFile,
    EndpointRegistry,
    v1,
    Container
} from '../../../lib/index.mjs';
describe('when-activating-v1-endpoint', () => {
    const container = new Container();
    beforeAll(() => {
        container.register(Github);
        container.register(Logging);
        container.register(GithubBranch);
        container.register(GithubFile);
        container.register(Store);
        container.register(EndpointRegistry);
        container.register(v1);
    });
    it('should create an instance', () => {
        const { instance } = container.get('$v1');
        expect(instance).toBeInstanceOf(v1);
    });
});