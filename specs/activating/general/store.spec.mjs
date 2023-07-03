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

    it('should have a writeFile member', () => {
        expect($store.writeFile).toBeDefined();
    });

    it('should have a readFile member', () => {
        expect($store.readFile).toBeDefined();
    });

    it('should have a removeFile member', () => {
        expect($store.removeFile).toBeDefined();
    });
});