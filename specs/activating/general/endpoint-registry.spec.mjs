import {
    Container,
} from '../../../lib/registry.mjs';
describe('when-activating-endpoint-registry', () => {
    let $endpointRegistry;
    beforeAll(() => {
        const container = new Container();
        ({ $endpointRegistry } = container);
    });
    it('should get an instance', () => {
        expect($endpointRegistry).toBeDefined();
    });
    it('should have a findHandler member', () => {
        expect($endpointRegistry.findHandler).toBeDefined();
    });
});