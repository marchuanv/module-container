import { Route, UserSession } from '../../../lib/registry.mjs';
describe('when-activating-endpoint-registry', () => {
    let route;
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
        route = new Route({ 
            content: '',
            username: 'JOE',
            sessionAuthToken,
            storeAuthToken: process.env.GIT,
            path: '/api/v1/config/get'
        });
    });
    it('should create an instance', () => {
        expect(route).toBeDefined();
    });
    it('should have a handle member', () => {
        expect(route.handle).toBeDefined();
    });
});