import { v1Endpoints } from '../../../lib/registry.mjs';
describe('when-activating-delete-config-endpoint', () => {
    let instance;
    beforeAll(async () => {
        instance = new v1Endpoints.DeleteConfigEndpoint({
            username: 'JOE',
            path: '/api/v1/config/delete',
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