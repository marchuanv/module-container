import { v1Endpoints, UserSession } from '../../../lib/registry.mjs';
describe('when-activating-get-config-endpoint', () => {
    let instance;
    beforeAll(async () => {
        const userCredentials = { username:'Joe', passphrase: 'Joe1234', storeAuthToken: 12345 };
        const userSession = new UserSession(userCredentials);
        const isRegistered = await userSession.register();
        expect(isRegistered).toBeTrue();
        const sessionAuthToken = await userSession.authenticate();
        expect(sessionAuthToken).toBeDefined();
        instance = new v1Endpoints.GetConfigEndpoint({
            username: 'JOE',
            path: '/api/v1/config/get',
            storeAuthToken: process.env.GIT,
            sessionAuthToken
        });
    });
    it('should get an instance', () => {
        expect(instance).toBeDefined();
    });
    it('should have a matchPath member', () => {
        expect(instance.matchPath).toBeDefined();
    });
});