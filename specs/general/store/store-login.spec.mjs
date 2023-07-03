import {
    Container,
} from '../../../lib/registry.mjs';
describe('when-logging-into-store', () => {
    let isLoggedIn;
    beforeAll(async () => {
        const container = new Container();
        const { $store, $logging } = container;
        $logging.setToInfo();
        expect($store).toBeDefined();
        expect($store.login).toBeDefined();
        isLoggedIn = await $store.login();
        await $store.logout();
    });
    it('should create a store session', () => {
        expect(isLoggedIn).toBeTrue();
    });
});