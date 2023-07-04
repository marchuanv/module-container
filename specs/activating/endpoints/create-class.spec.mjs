import {
    Container
} from '../../../lib/registry.mjs';
describe('when-activating-create-class-endpoint', () => {
    let $createClassEndpoint;
    beforeAll(() => {
        const container = new Container();
        ({ $createClassEndpoint } = container);
    });
    it('should get an instance', () => {
        expect($createClassEndpoint).toBeDefined();
    });
    it('should have a name member', () => {
        expect($createClassEndpoint.name).toBe('active-object-class-create');
    });
});