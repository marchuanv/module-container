import {
    Store,
} from '../../../lib/registry.mjs';
describe('when logging out of the store', () => {
    let prevStoreId;
    let storeId;
    beforeAll(async () => {
        let store = new Store();
        const isLoggedIn = await store.login();
        expect(isLoggedIn).toBeTrue();
        prevStoreId = store.objectId;
        await store.logout();
        store = new Store();
        await store.login();
        storeId = store.objectId;
        await store.logout();
    });
    it('should destroy store', () => {
        expect(prevStoreId).not.toBe(storeId);
    });
});