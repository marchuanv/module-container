import {
    Container,
    GetConfig,
    GetClass
} from '../../lib/index.mjs';
describe('when-getting-instances-of-registered-types', () => {
    const references = new WeakMap();
    let getConfigRef;
    let getClassRef;
    beforeAll(() => {
        const container = new Container();
        let { ref } = container.register(GetConfig);
        getConfigRef = ref;
        ({ ref } = container.register(GetClass));
        getClassRef = ref;
        references.set(references, { container });
    });
    it('should create an instance of GetConfig', () => {
        const { container } = references.get(references);
        const { instance } = container.get(getConfigRef);
        expect(instance).toBeInstanceOf(GetConfig);
    });
    it('should create an instance of GetClass', () => {
        const { container } = references.get(references);
        const { instance } = container.get(getClassRef);
        expect(instance).toBeInstanceOf(GetClass);
    });
});