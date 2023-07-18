import { Store } from '../../../lib/registry.mjs';
describe('when-activating-store', () => {
    let store;
    beforeAll(async () => {
        store = new Store({ branchName: 'tests', filePath: 'specification-file-test.json', token: process.env.GIT });
    });
    it('should create an instance', () => {
        expect(store).toBeDefined();
    });

    it('should have a exists member', () => {
        expect(store.exists).toBeDefined();
    });

    it('should have a write member', () => {
        expect(store.write).toBeDefined();
    });

    it('should have a read member', () => {
        expect(store.read).toBeDefined();
    });

    it('should have a remove member', () => {
        expect(store.remove).toBeDefined();
    });
});