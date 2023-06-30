import {
    Logging,
    Store,
    GithubBranch,
    Github,
    GithubFile,
    CreateClass,
    Container
} from '../../../lib/index.mjs';
describe('when-activating-create-class-endpoint', () => {
    const container = new Container();
    beforeAll(() => {
        container.register(Github);
        container.register(Logging);
        container.register(GithubBranch);
        container.register(GithubFile);
        container.register(Store);
        container.register(CreateClass);
    });
    it('should create an instance', () => {
        const { instance } = container.get('$createClass');
        expect(instance).toBeInstanceOf(CreateClass);
    });
});