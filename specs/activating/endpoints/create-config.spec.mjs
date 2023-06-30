import {
    Logging,
    Store,
    GithubBranch,
    Github,
    GithubFile,
    CreateConfig,
    Container
} from '../../../lib/index.mjs';
describe('when-activating-create-config-endpoint', () => {
    const container = new Container();
    beforeAll(() => {
        container.register(Github);
        container.register(Logging);
        container.register(GithubBranch);
        container.register(GithubFile);
        container.register(Store);
        container.register(CreateConfig);
    });
    it('should create an instance', () => {
        const { instance } = container.get('$createConfig');
        expect(instance).toBeInstanceOf(CreateConfig);
    });
});