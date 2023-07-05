import {
    Store,
} from '../../../lib/registry.mjs';
describe('when-logging-into-store', () => {
    let isLoggedIn;
    beforeAll(async () => {
        store = new Store({ branchName: 'tests', filePath: 'store-file-test.json', token: process.env.GIT });
        expect(store).toBeDefined();
        expect(store.login).toBeDefined();
        isLoggedIn = await store.login();
        store.logout();
    });
    it('should create a store session', () => {
        expect(isLoggedIn).toBeTrue();
    });
});