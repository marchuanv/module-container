import utils from 'utils';
import { v1Endpoints } from '../../../../lib/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when creating config in the store given that the file does NOT exist', () => {
    let sessionAuthToken;
    beforeAll(async () => {
        const userCredentials = { username:'Joe', passphrase: 'Joe1234', storeAuthToken: 12345 };
        const userSession = new UserSession(userCredentials);
        const isRegistered = await userSession.register();
        expect(isRegistered).toBeTrue();
        sessionAuthToken = await userSession.authenticate();
        expect(sessionAuthToken).toBeDefined();
        const args = {
            username: 'JOE',
            sessionAuthToken,
            storeAuthToken: process.env.GIT,
            path: '/api/v1/config/create',
            content: JSON.stringify({
                className: 'HelloWorld',
                language: 'JavaScript',
                dependencyInjection: false
            })
        }
        let createConfigEndpoint = new v1Endpoints.CreateConfigEndpoint(args);
        const { statusMessage, responseContent, contentType } = await createConfigEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        const { message } = utils.getJSONObject(responseContent);
        expect(message).toBe('active-object-config.json was created');
    });

    it('should succesfully create the config', async () => {
        const getConfigEndpoint = new v1Endpoints.GetConfigEndpoint({
            username: 'JOE',
            sessionAuthToken,
            storeAuthToken: process.env.GIT,
            path: '/api/v1/config/get'
        });
        const { statusMessage, responseContent, contentType } = await getConfigEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        expect(responseContent).toBeDefined();
    });

    afterAll(async () => {
        const args = {
            username: 'JOE',
            sessionAuthToken,
            storeAuthToken: process.env.GIT,
            path: '/api/v1/config/delete'
        }
        const deleteConfigEndpoint = new v1Endpoints.DeleteConfigEndpoint(args);
        const { statusMessage, contentType } = await deleteConfigEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
    });
});