import {
    Container,
} from '../../../lib/registry.mjs';
describe('when-activating-container', () => {
    let container;
    beforeAll(() => {
        container = new Container();
    });
    it('should get an instance', () => {
        expect(container).toBeDefined();
        expect(container).toBeInstanceOf(Container);
    });
});