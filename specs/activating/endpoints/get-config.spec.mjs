import {
    allEndpoints
} from '../../../lib/endpoints/registry.mjs';
describe('when-activating-get-config-endpoint', () => {
    let instance;
    beforeAll(() => {
        instance = new allEndpoints.v1.GetConfigEndpoint({
            path: '/api/v1/config/get',
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