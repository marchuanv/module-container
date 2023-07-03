import {
    Container,
} from '../../../lib/registry.mjs';
describe('when-activating-github-file', () => {
    let $githubFile;
    beforeAll(() => {
        const container = new Container();
        ({ $githubFile } = container);
    });
    it('should get an instance', () => {
        expect($githubFile).toBeDefined();
    });
    it('should have a getMetadata member', () => {
        expect($githubFile.getMetadata).toBeDefined();
    });
    it('should have an exists member', () => {
        expect($githubFile.exists).toBeDefined();
    });
    it('should have a getContent member', () => {
        expect($githubFile.getContent).toBeDefined();
    });
    it('should have a ensureContent member', () => {
        expect($githubFile.ensureContent).toBeDefined();
    });
    it('should have a delete member', () => {
        expect($githubFile.delete).toBeDefined();
    });
});