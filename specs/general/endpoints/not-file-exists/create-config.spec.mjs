import {
    allEndpoints
} from '../../../../lib/endpoints/registry.mjs';
import { Github } from '../../../../lib/github.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when getting config from the store given that the file does NOT exist', () => {
    let { message, content } = {};
    beforeAll(async () => {
        let createConfigEndpoint = new allEndpoints.v1.CreateConfigEndpoint({
            token: process.env.GIT,
            path: '/api/v1/config/create',
            content: JSON.stringify({
                className: 'HelloWorld',
                language: 'JavaScript',
                dependencyInjection: false
            })
        });
        createConfigEndpoint.mock({ Class: Github });
        const { statusMessage, responseContent, contentType } = await createConfigEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        ({ message, content } = JSON.parse(responseContent));
    });
    it('should return a message', async () => {
        expect(message).toBeDefined();
        expect(message).toBe('active-object-config.json was created');
    });
    it('should NOT provide file content', async () => {
        expect(content).not.toBeDefined();
    });
});