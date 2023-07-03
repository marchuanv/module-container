import {
    Container,
} from '../../../lib/registry.mjs';
describe('when-activating-store', () => {
    let $store;
    beforeAll(() => {
        const container = new Container();
        ({ $store } = container);
    });
    it('should create an instance', () => {
        expect($store).toBeDefined();
        expect($store.login).toBeDefined();
        expect($store.exists).toBeDefined();
        expect($store.writeFile).toBeDefined();
        expect($store.readFile).toBeDefined();
        expect($store.removeFile).toBeDefined();
    });
});