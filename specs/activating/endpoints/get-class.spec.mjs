import { v1Endpoints } from '../../../lib/registry.mjs';
describe('when-activating-get-class-endpoint', () => {
    let instance;
    beforeAll(async () => {
        instance = new v1Endpoints.GetClassEndpoint({
            username: 'JOE',
            path: '/api/v1/class/get',
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