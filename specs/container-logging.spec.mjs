import { Class } from './class.mjs';
describe('when logging messages given a container extends logging', () => {
    it('should inherently write messages', () => {
        const instance = new Class();
        instance.log('test message');
    });
});