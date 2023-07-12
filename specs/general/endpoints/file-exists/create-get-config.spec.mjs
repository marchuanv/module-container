import {
    allEndpoints
} from '../../../../lib/endpoints/registry.mjs';
import { Github } from '../../../../lib/registry.mjs';
import { GithubFake } from '../../../fakes/registry.mjs';
import utils from 'utils';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when getting config from the store given that the file exists', () => {
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
        await createConfigEndpoint.mock({ Class: Github, FakeClass: GithubFake });
        let getConfigEndpoint = new allEndpoints.v1.GetConfigEndpoint(args);
        await getConfigEndpoint.mock({ Class: Github, FakeClass: GithubFake });
        {
            const { statusMessage } = await createConfigEndpoint.handle();
            expect(statusMessage).toBe('200 Success');
        }
        const { statusMessage, responseContent, contentType } = await getConfigEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        const response = utils.getJSONObject(responseContent);
        expect(response).toBeDefined();
        expect(response).not.toBeNull();
        ({ message, content } = response);
    });
    it('should return a message', async () => {
        expect(message).toBeDefined();
        expect(message).toBe('Success');
    });
    it('should provide the file content', async () => {
        expect(content).toBeDefined();
        expect(content.className).toBe('HelloWorld');
        expect(content.language).toBe('JavaScript');
        expect(content.dependencyInjection).toBeFalse();
    });
    afterAll(async () => {
        const args = {
            token: process.env.GIT,
            path: '/api/v1/config/delete'
        };
        const deleteConfigEndpoint = new allEndpoints.v1.DeleteConfigEndpoint(args);
        await deleteConfigEndpoint.mock({ Class: Github, FakeClass: GithubFake });
        const { statusMessage, contentType } = await deleteConfigEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
    });
});