import {
    allEndpoints
} from '../../../lib/endpoints/registry.mjs';
describe('when-activating-delete-class-endpoint', () => {
    let instance;
    beforeAll(() => {
        instance = new allEndpoints.v1.DeleteClassEndpoint({
            path: '/api/v1/class/delete',
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