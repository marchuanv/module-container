import {
    allEndpoints
} from '../../../../lib/endpoints/registry.mjs';
import { Github } from '../../../../lib/registry.mjs';
import { GithubFake } from '../../../fakes/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when deleting config from the store given that the file exists', () => {
    let { message, content } = {};
    beforeAll(async () => {
        const args = {
            token: process.env.GIT,
            path: '/api/v1/config/create',
            content: JSON.stringify({
                className: 'HelloWorld',
                language: 'JavaScript',
                dependencyInjection: false
            })
        };
        let createConfigEndpoint = new allEndpoints.v1.CreateConfigEndpoint(args);
        createConfigEndpoint.mock({ Class: Github, FakeClass: GithubFake });
        let deleteConfigEndpoint = new allEndpoints.v1.DeleteClassEndpoint(args);
        deleteConfigEndpoint.mock({ Class: Github, FakeClass: GithubFake });
        {
            const { statusMessage } = await createConfigEndpoint.handle();
            expect(statusMessage).toBe('200 Success');
        }
        const { statusMessage, responseContent, contentType } = await deleteConfigEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        ({ message, content } = JSON.parse(responseContent));
    });
    it('should return a message', async () => {
        expect(message).toBeDefined();
        expect(message).toBe(`active-object-config.json was removed`);
    });
    it('should NOT provide the file content', async () => {
        expect(content).not.toBeDefined();
    });
});