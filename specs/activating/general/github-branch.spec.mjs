import {
    Container,
} from '../../../lib/registry.mjs';
describe('when-activating-github-branch', () => {
    let $githubBranch;
    beforeAll(() => {
        const container = new Container();
        ({ $githubBranch } = container);
    });
    it('should create an instance', () => {
        expect($githubBranch).toBeDefined();
        expect($githubBranch.create).toBeDefined();
        expect($githubBranch.delete).toBeDefined();
        expect($githubBranch.isExisting).toBeDefined();
    });
});