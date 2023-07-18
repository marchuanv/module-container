import { v1Endpoints } from '../../../lib/registry.mjs';
describe('when-activating-get-class-endpoint', () => {
    let instance;
    beforeAll(async () => {
        instance = new v1Endpoints.GetClassEndpoint({
            path: '/api/v1/class/get',
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