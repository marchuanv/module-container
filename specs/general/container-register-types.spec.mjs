import {
    Container,
    GetConfig,
    GetClass
} from '../../lib/index.mjs';
describe('when-registering-types-given-a-container', () => {
    const references = new WeakMap();
    beforeAll(() => {
        const container = new Container();
        container.register(GetConfig);
        container.register(GetClass);
        references.set(references, { container });
    });
    it('should accept the GetConfig', () => {
        const { container } = references.get(references);
        expect(container.isRegistered(GetConfig)).toBeTrue();
    });
    it('should accept the GetClass', () => {
        const { container } = references.get(references);
        expect(container.isRegistered(GetClass)).toBeTrue();
    });
});