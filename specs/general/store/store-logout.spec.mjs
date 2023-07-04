import {
    Container,
} from '../../../lib/registry.mjs';
describe('when logging out of the store', () => {

    let $prevStoreId;
    let $prevLoggingId;
    let $prevOctokitId;
    let $prevGithubFileId;
    let $prevGithubBranchId;

    beforeAll(async () => {

        const {
            $store,
            $logging,
            $octokitWithDefaults,
            $githubFile,
            $githubBranch
        } = new Container();

        $logging.setToInfo();
        expect($store).toBeDefined();
        expect($store.login).toBeDefined();
        const isLoggedIn = await $store.login();
        expect(isLoggedIn).toBeTrue();
        $prevStoreId = $store.objectId;
        $prevLoggingId = $logging.objectId;
        $prevOctokitId = $octokitWithDefaults.objectId;
        $prevGithubFileId = $githubFile.objectId;
        $prevGithubBranchId = $githubBranch.objectId;

        await $store.logout();
    });
    it('should garbage collect octokit', () => {
        const { $octokitWithDefaults } = new Container();
        const $octokitId = $octokitWithDefaults.objectId;
        expect($prevOctokitId).not.toBe($octokitId);
    });
    it('should garbage collect store', () => {
        const { $store } = new Container();
        const $storeId = $store.objectId;
        expect($prevStoreId).not.toBe($storeId);
    });
    it('should garbage collect githubFile', () => {
        const { $githubFile } = new Container();
        const $githubFileId = $githubFile.objectId;
        expect($prevGithubFileId).not.toBe($githubFileId);
    });
    it('should garbage collect githubBranch', () => {
        const { $githubBranch } = new Container();
        const $githubBranchId = $githubBranch.objectId;
        expect($prevGithubBranchId).not.toBe($githubBranchId);
    });
});