import { TestClass } from './class.mjs';
describe('when logging messages given a container extends logging', () => {
    it('should inherently write messages', () => {
        const instance = new TestClass();
        instance.log('test message');
    });
});