import { v1Endpoints } from '../../../lib/registry.mjs';
describe('when-activating-create-config-endpoint', () => {
    let instance;
    beforeAll(async () => {
        instance = new v1Endpoints.CreateConfigEndpoint({
            username: 'JOE',
            path: '/api/v1/config/create',
            content: JSON.stringify({ className: 'HelloWorld', language: 'JavaScript', dependencyInjection: false }),
            storeAuthToken: process.env.GIT
        });
    });
    it('should get an instance', () => {
        expect(instance).toBeDefined();
    });
    it('should have a matchPath member', () => {
        expect(instance.matchPath).toBeDefined();
    });
});