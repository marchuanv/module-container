import {
    Logging,
    Store,
    GithubBranch,
    Github,
    GithubFile,
    EndpointRegistry,
    Container
} from '../../../lib/index.mjs';
describe('when-activating-endpoint-registry', () => {
    const container = new Container();
    beforeAll(() => {
        container.register(Logging);
        container.register(Github);
        container.register(GithubBranch);
        container.register(GithubFile);
        container.register(Store);
        container.register(EndpointRegistry);
    });
    it('should create an instance', () => {
        const { instance } = container.get('$endpointRegistry');
        expect(instance).toBeInstanceOf(EndpointRegistry);
    });
});