import {
    Container,
} from '../../../lib/registry.mjs';
describe('when-activating-store', () => {
    let $store;
    beforeAll(() => {
        const container = new Container();
        ({ $store } = container);
    });
    it('should get an instance', () => {
        expect($store).toBeDefined();
    });

    it('should have a login member', () => {
        expect($store.login).toBeDefined();
    });

    it('should have a exists member', () => {
        expect($store.exists).toBeDefined();
    });

    it('should have a write member', () => {
        expect($store.write).toBeDefined();
    });

    it('should have a read member', () => {
        expect($store.read).toBeDefined();
    });

    it('should have a remove member', () => {
        expect($store.remove).toBeDefined();
    });
});