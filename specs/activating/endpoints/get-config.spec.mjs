import { v1Endpoints } from '../../../lib/registry.mjs';
describe('when-activating-get-config-endpoint', () => {
    let instance;
    beforeAll(async () => {
        instance = new v1Endpoints.GetConfigEndpoint({
            username: 'JOE',
            path: '/api/v1/config/get',
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