import {
    allEndpoints
} from '../../../lib/endpoints/registry.mjs';
describe('when-activating-get-class-endpoint', () => {
    let instance;
    beforeAll(() => {
        instance = new allEndpoints.v1.GetClassEndpoint({
            path: '/api/v1/class/get',
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