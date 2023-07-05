import {
    Store,
} from '../../../lib/registry.mjs';
describe('when logging out of the store', () => {
    let prevStoreId;
    let storeId;
    beforeAll(async () => {
        let store = new Store({ branchName: 'tests', filePath: 'store-file-test.json', token: process.env.GIT });
        const isLoggedIn = await store.login();
        expect(isLoggedIn).toBeTrue();
        prevStoreId = store.objectId;
        await store.logout();
        store = new Store({ branchName: 'tests', filePath: 'store-file-test.json', token: process.env.GIT });
        await store.login();
        storeId = store.objectId;
        await store.logout();
    });
    it('should destroy store', () => {
        expect(prevStoreId).not.toBe(storeId);
    });
});