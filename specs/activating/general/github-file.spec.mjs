import {
    Github,
    GithubFile,
} from '../../../lib/registry.mjs';
import { GithubFake } from '../../fakes/registry.mjs';
describe('when-activating-github-file', () => {
    let githubFile;
    beforeAll(async () => {
        githubFile = new GithubFile({ branchName: 'tests', fileName: 'github-file-test.json', token: process.env.GIT });
        await githubFile.mock({ Class: Github, FakeClass: GithubFake });
    });
    it('should create an instance', () => {
        expect(githubFile).toBeDefined();
    });
    it('should have a getMetadata member', () => {
        expect(githubFile.getMetadata).toBeDefined();
    });
    it('should have an exists member', () => {
        expect(githubFile.exists).toBeDefined();
    });
    it('should have a getContent member', () => {
        expect(githubFile.getContent).toBeDefined();
    });
    it('should have a ensureContent member', () => {
        expect(githubFile.ensureContent).toBeDefined();
    });
    it('should have a delete member', () => {
        expect(githubFile.delete).toBeDefined();
    });
});