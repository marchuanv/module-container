import {
    Logging,
    Store,
    GithubBranch,
    Github,
    GithubFile,
    GetClass,
    Container
} from '../../../lib/index.mjs';
describe('when-activating-get-config-endpoint', () => {
    const container = new Container();
    beforeAll(() => {
        container.register(Github);
        container.register(Logging);
        container.register(GithubBranch);
        container.register(GithubFile);
        container.register(Store);
        container.register(GetClass);
    });
    it('should create an instance', () => {
        const { instance } = container.get('$getClass');
        expect(instance).toBeInstanceOf(GetClass);
    });
});