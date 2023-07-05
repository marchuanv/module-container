import {
    allEndpoints
} from '../../../lib/endpoints/registry.mjs';
describe('when-activating-create-config-endpoint', () => {
    let instance;
    beforeAll(() => {
        instance = new allEndpoints.v1.CreateConfigEndpoint({
            path: '/api/v1/config/create',
            content: JSON.stringify({ className: 'HelloWorld', language: 'JavaScript', dependencyInjection: false }),
            headers: {}
        });
    });
    it('should get an instance', () => {
        expect(instance).toBeDefined();
    });
    it('should have a matchPath member', () => {
        expect(instance.matchPath).toBeDefined();
    });
});