import utils from 'utils';
import {
    allEndpoints
} from '../../../../lib/endpoints/registry.mjs';
import { Github } from '../../../../lib/registry.mjs';
import { GithubFake } from '../../../fakes/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when getting config from the store given that the file exists', () => {
    beforeAll(async () => {
        const createConfigEndpoint = new allEndpoints.v1.CreateConfigEndpoint({
            token: process.env.GIT,
            path: '/api/v1/config/create',
            content: JSON.stringify({
                className: 'HelloWorld',
                language: 'JavaScript',
                dependencyInjection: false
            })
        });
        await createConfigEndpoint.mock({ Class: Github, FakeClass: GithubFake });
        {
            const { statusMessage, responseContent, contentType } = await createConfigEndpoint.handle();
            expect(statusMessage).toBe('200 Success');
            expect(contentType).toBe('application/json');
            const { message } = utils.getJSONObject(responseContent);
            expect(message).toBe('active-object-config.json was created');
        }
        const { statusMessage, responseContent, contentType } = await createConfigEndpoint.handle();
        expect(statusMessage).toBe('409 Conflict');
        expect(contentType).toBe('application/json');
        const { message } = utils.getJSONObject(responseContent);
        expect(message).toBe('active-object-config.json already exist');
    });
    it('should succesfully create the config', async () => {
        const getConfigEndpoint = new allEndpoints.v1.GetConfigEndpoint({
            token: process.env.GIT,
            path: '/api/v1/config/get'
        });
        await getConfigEndpoint.mock({ Class: Github, FakeClass: GithubFake });
        const { statusMessage, responseContent, contentType } = await getConfigEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        expect(responseContent).toBeDefined();
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