import {
    allEndpoints
} from '../../../lib/endpoints/registry.mjs'
describe('when-activating-create-class-endpoint', () => {
    let instance;
    beforeAll(() => {
        instance = new allEndpoints.v1.CreateClassEndpoint({
            path: '/api/v1/class/create',
            content: 'class HelloWorld() {}',
            token: process.env.GIT
        });
    });
    it('should get an instance', () => {
        expect(instance).toBeDefined();
    });
    it('should have a matchPath member', () => {
        expect(instance.matchPath).toBeDefined();
    });
});