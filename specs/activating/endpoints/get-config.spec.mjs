import {
    Container
} from '../../../lib/registry.mjs';
describe('when-activating-get-config-endpoint', () => {
    let $getConfigEndpoint;
    beforeAll(() => {
        const container = new Container();
        ({ $getConfigEndpoint } = container);
    });
    it('should get an instance', () => {
        expect($getConfigEndpoint).toBeDefined();
    });
    it('should verify class members', () => {
        expect($getConfigEndpoint.name).toBe('active-object-config-get');
    });
});