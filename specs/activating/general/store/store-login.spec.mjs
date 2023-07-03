import {
    Container,
} from '../../../../lib/registry.mjs';
describe('when-logging-into-store', () => {
    let isLoggedIn;
    beforeAll(async () => {
        const container = new Container();
        const { $store, $logging } = container;
        $logging.setToInfo();
        expect($store).toBeDefined();
        expect($store.login).toBeDefined();
        isLoggedIn = await $store.login();
    });
    it('should create a store session', () => {
        expect(isLoggedIn).toBeTrue();
    });
    afterAll(async () => {
        let container = new Container();
        let { $store } = container;
        await $store.logout();
        try {
            ({ $store } = container);
        } catch (err) {
            expect(err.message).toBe(`$store was flagged for garbage collection.`);
        }
        try {
            ({ $octokitWithDefaults } = container);
        } catch (err) {
            expect(err.message).toBe(`$octokitWithDefaults was flagged for garbage collection.`);
        }
    });
});