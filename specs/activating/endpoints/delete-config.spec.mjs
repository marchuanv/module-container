import {
    allEndpoints
} from '../../../lib/endpoints/registry.mjs';
describe('when-activating-delete-config-endpoint', () => {
    let instance;
    beforeAll(() => {
        instance = new allEndpoints.v1.DeleteConfigEndpoint({
            path: '/api/v1/config/delete',
            content: '',
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