import { Container } from '../lib/container.mjs';
import { Class } from './class.mjs';
describe('when creating an instance of the container class', () => {
    it('should get an error', () => {
        let error;
        try {
            new Container();
        } catch (err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBeDefined();
        expect(error.message).toBe('Container is an abstract class');
    });
});
describe('when creating an instance of a class that extends the container class', () => {
    it('should NOT get an error', () => {
        let error;
        try {
            new Class();
        } catch (err) {
            error = err;
        }
        expect(error).not.toBeDefined();
    });
});