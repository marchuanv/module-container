import {
    Container
} from '../../../lib/registry.mjs';
describe('when-activating-v1-endpoint', () => {
    let $v1Endpoint;
    beforeAll(() => {
        const container = new Container();
        ({ $v1Endpoint } = container);
    });
    it('should get an instance', () => {
        expect($v1Endpoint).toBeDefined();
    });
    it('should verify class members', () => {
        expect($v1Endpoint.name).toBe('v1');
    });
});