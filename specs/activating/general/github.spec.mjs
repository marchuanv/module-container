import {
    Github,
    Container
} from '../../../lib/index.mjs';
describe('when-activating-github', () => {
    const container = new Container();
    beforeAll(() => {
        container.register(Github);
    });
    it('should create an instance', () => {
        const { instance } = container.get('$github');
        expect(instance).toBeInstanceOf(Github);
    });
});