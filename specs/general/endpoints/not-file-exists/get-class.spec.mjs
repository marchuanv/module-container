import {
    allEndpoints
} from '../../../../lib/endpoints/registry.mjs';
import { GithubFake } from '../../../fakes/registry.mjs';
import { Github } from '../../../../lib/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when getting a class from the store given that the file does NOT exist', () => {
    let { message, content } = {};
    beforeAll(async () => {
        let getClassEndpoint = new allEndpoints.v1.GetClassEndpoint({
            token: process.env.GIT,
            path: '/api/v1/class/get'
        });
        await getClassEndpoint.mock({ Class: Github, FakeClass: GithubFake });
        const { statusMessage, responseContent, contentType } = await getClassEndpoint.handle();
        expect(statusMessage).toBe('404 Not Found');
        expect(contentType).toBe('application/json');
        ({ message, content } = JSON.parse(responseContent));
    });
    it('should return a message', async () => {
        expect(message).toBeDefined();
        expect(message).toBe(`active-object-class.js was not found`);
    });
    it('should NOT provide the file content', async () => {
        expect(content).not.toBeDefined();
    });
});