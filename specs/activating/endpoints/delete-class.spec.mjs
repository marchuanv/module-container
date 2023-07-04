import {
    Container
} from '../../../lib/registry.mjs';
describe('when-activating-delete-class-endpoint', () => {
    let $deleteClassEndpoint;
    beforeAll(() => {
        const container = new Container();
        ({ $deleteClassEndpoint } = container);
    });
    it('should get an instance', () => {
        expect($deleteClassEndpoint).toBeDefined();
    });
    it('should have a name member', () => {
        expect($deleteClassEndpoint.name).toBe('active-object-class-delete');
    });
});