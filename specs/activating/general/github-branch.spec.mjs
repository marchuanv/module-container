import {
    Container,
} from '../../../lib/registry.mjs';
describe('when-activating-github-branch', () => {
    let $githubBranch;
    beforeAll(() => {
        const container = new Container();
        ({ $githubBranch } = container);
    });
    it('should get an instance', () => {
        expect($githubBranch).toBeDefined();
    });
    it('should have a create member', () => {
        expect($githubBranch.create).toBeDefined();
    });
    it('should have a delete member', () => {
        expect($githubBranch.delete).toBeDefined();
    });
    it('should have an exists member', () => {
        expect($githubBranch.exists).toBeDefined();
    });
});