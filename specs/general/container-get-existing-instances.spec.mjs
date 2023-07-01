import {
    Container,
    GetConfig,
    GetClass
} from '../../lib/index.mjs';
describe('when-getting-existing-instances', () => {
    const references = new WeakMap();
    let getConfigRef;
    let getClassRef;
    let getConfigId;
    let getClassId;
    
    beforeAll(() => {
        const container = new Container();

        let { ref } = container.register(GetConfig);
        getConfigRef = ref;
        ({ ref } = container.register(GetClass));
        getClassRef = ref;

        let { id } = container.get(getConfigRef);
        getConfigId = id;
        ({ id } = container.get(getClassRef));
        getClassId = id;

        references.set(references, { container });
    });
    it('should retrieve previously created instance of GetConfig', () => {
        const { container } = references.get(references);
        const { instance, id } = container.get(getConfigRef);
        expect(getConfigId).toBeDefined();
        expect(getConfigId).toBe(id);
        expect(instance).toBeInstanceOf(GetConfig);
    });
    it('should retrieve previously created instance of GetClass', () => {
        const { container } = references.get(references);
        const { instance, id } = container.get(getClassRef);
        expect(getClassId).toBeDefined();
        expect(getClassId).toBe(id);
        expect(instance).toBeInstanceOf(GetClass);
    });
});