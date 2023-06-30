import {
    Container,
    CreateClass,
    CreateConfig,
    DeleteClass,
    DeleteConfig,
    GetClass,
    GetConfig
} from '../../../lib/index.mjs';
describe('when-activating-container', () => {
    const references = new WeakMap();
    beforeAll(() => {
        const container = new Container();
        references.set(references, { container });
    });
    it('should create an instance', () => {
        const { container } = references.get(references);
        expect(container).toBeInstanceOf(Container);
    });
});