import utils from 'utils';
import { v1Endpoints } from '../../../../lib/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when getting config from the store given that the file exists', () => {
    beforeAll(async () => {
        const createConfigEndpoint = new v1Endpoints.CreateConfigEndpoint({
            token: process.env.GIT,
            path: '/api/v1/config/create',
            content: JSON.stringify({
                className: 'HelloWorld',
                language: 'JavaScript',
                dependencyInjection: false
            })
        });
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
        const getConfigEndpoint = new v1Endpoints.GetConfigEndpoint({
            token: process.env.GIT,
            path: '/api/v1/config/get'
        });
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
        const deleteConfigEndpoint = new v1Endpoints.DeleteConfigEndpoint(args);
        const { statusMessage, contentType } = await deleteConfigEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
    });
});