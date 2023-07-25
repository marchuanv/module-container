import { Route } from '../../../lib/registry.mjs';
describe('when-activating-endpoint-registry', () => {
    let route;
    beforeAll(async () => {
        route = new Route({ path: '/api/v1/config/get', content: '', storeAuthToken: process.env.GIT });
    });
    it('should create an instance', () => {
        expect(route).toBeDefined();
    });
    it('should have a handle member', () => {
        expect(route.handle).toBeDefined();
    });
});