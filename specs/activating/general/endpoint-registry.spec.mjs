import {
    Container,
} from '../../../lib/registry.mjs';
describe('when-activating-endpoint-registry', () => {
    let $endpointRegistry;
    beforeAll(() => {
        const container = new Container();
        ({ $endpointRegistry } = container);
    });
    it('should create an instance', () => {
        expect($endpointRegistry).toBeDefined();
        expect($endpointRegistry.findHandler).toBeDefined();
    });
});