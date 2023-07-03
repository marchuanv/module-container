import {
    Container
} from '../../../lib/registry.mjs';
describe('when-activating-delete-config-endpoint', () => {
    let $deleteConfigEndpoint;
    beforeAll(() => {
        const container = new Container();
        ({ $deleteConfigEndpoint } = container);
    });
    it('should get an instance', () => {
        expect($deleteConfigEndpoint).toBeDefined();
    });
    it('should verify class members', () => {
        expect($deleteConfigEndpoint.name).toBe('active-object-config-delete');
    });
});