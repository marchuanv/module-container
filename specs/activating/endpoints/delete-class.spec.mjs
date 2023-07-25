import { v1Endpoints, UserSession } from '../../../lib/registry.mjs';
describe('when-activating-delete-class-endpoint', () => {
    let instance;
    beforeAll(async () => {
        const userCredentials = { username:'Joe', passphrase: 'Joe1234', storeAuthToken: 12345, sessionAuthToken: null };
        const userSession = new UserSession(userCredentials);
        const isRegistered = await userSession.register();
        expect(isRegistered).toBeTrue();
        const sessionAuthToken = await userSession.authenticate();
        expect(sessionAuthToken).toBeDefined();
        instance = new v1Endpoints.DeleteClassEndpoint({
            username: 'JOE',
            path: '/api/v1/class/delete',
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