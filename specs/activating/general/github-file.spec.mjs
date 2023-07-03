import {
    Container,
} from '../../../lib/registry.mjs';
describe('when-activating-github-file', () => {
    let $githubFile;
    beforeAll(() => {
        const container = new Container();
        ({ $githubFile } = container);
    });
    it('should create an instance', () => {
        expect($githubFile).toBeDefined();
        expect($githubFile.getFileMetadata).toBeDefined();
        expect($githubFile.isExisting).toBeDefined();
        expect($githubFile.getFileContent).toBeDefined();
        expect($githubFile.ensureFileContent).toBeDefined();
        expect($githubFile.deleteFile).toBeDefined();
    });
});