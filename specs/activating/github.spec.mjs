import {
    Github,
} from '../../lib/index.mjs';
describe('when-activating-github', () => {
    const references = new WeakMap();
    beforeAll(() => {
        const github = new Github();
        references.set(references, { github });
    });
    it('should create an instace', () => {
        const { github } = references.get(references);
        expect(github).toBeInstanceOf(Github)
    });
});