import {
    allEndpoints
} from '../../../../lib/endpoints/registry.mjs';
import { Github } from '../../../../lib/registry.mjs';
import { GithubFake } from '../../../fakes/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when deleting a class from the store given that the file does NOT exist', () => {
    let { message, content } = {};
    beforeAll(async () => {
        let deleteClassEndpoint = new allEndpoints.v1.DeleteClassEndpoint({
            token: process.env.GIT,
            path: '/api/v1/class/delete'
        });
        await deleteClassEndpoint.mock({ Class: Github, FakeClass: GithubFake });
        const { statusMessage, responseContent, contentType } = await deleteClassEndpoint.handle();
        expect(statusMessage).toBe('404 Not Found');
        expect(contentType).toBe('application/json');
        ({ message, content } = JSON.parse(responseContent));
    });
    it('should return a message', async () => {
        expect(message).toBeDefined();
        expect(message).toBe(`active-object-class.js was not found`);
    });
    it('should NOT provide file content', async () => {
        expect(content).not.toBeDefined();
    });
});