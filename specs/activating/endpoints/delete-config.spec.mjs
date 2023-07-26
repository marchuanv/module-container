import { v1Endpoints, UserSession } from '../../../lib/registry.mjs';
describe('when-activating-delete-config-endpoint', () => {
    let instance;
    beforeAll(async () => {
        const userCredentials = { username:'Joe', passphrase: 'Joe1234', storeAuthToken: 12345 };
        const userSession = new UserSession(userCredentials);
        if (!(await userSession.isRegistered())) {
            await userSession.register();
        }
        const isRegistered = await userSession.isRegistered();
        expect(isRegistered).toBeTrue();
        const sessionAuthToken = await userSession.authenticate();
        expect(sessionAuthToken).toBeDefined();
        instance = new v1Endpoints.DeleteConfigEndpoint({
            username: 'JOE',
            path: '/api/v1/config/delete',
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