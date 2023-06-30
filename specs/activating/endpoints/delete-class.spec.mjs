import {
    Logging,
    Store,
    GithubBranch,
    Github,
    GithubFile,
    DeleteClass,
    Container
} from '../../../lib/index.mjs';
describe('when-activating-delete-class-endpoint', () => {
    const container = new Container();
    beforeAll(() => {
        container.register(Github);
        container.register(Logging);
        container.register(GithubBranch);
        container.register(GithubFile);
        container.register(Store);
        container.register(DeleteClass);
    });
    it('should create an instance', () => {
        const { instance } = container.get('$deleteClass');
        expect(instance).toBeInstanceOf(DeleteClass);
    });
});