import {
    Logging,
} from '../../lib/index.mjs';
describe('when-activating-logging', () => {
    const references = new WeakMap();
    beforeAll(() => {
        const logging = new Logging();
        references.set(references, { logging });
    });
    it('should create an instace', () => {
        const { logging } = references.get(references);
        expect(logging).toBeInstanceOf(Logging)
    });
});