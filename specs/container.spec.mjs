import { Container } from '../lib/registry.mjs';
describe('when-activating-container', () => {
    let error;
    beforeAll(() => {
        try {
            new Container();
        } catch (err) {
            error = err;
        }
    });
    it('should get an error', () => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBeDefined();
        expect(error.message).toBe('Container is an abstract class');
    });
});