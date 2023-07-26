import { v1Endpoints, UserSession } from '../../../lib/registry.mjs';
describe('when-activating-create-class-endpoint', () => {
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
        instance = new v1Endpoints.CreateClassEndpoint({
            username: 'JOE',
            sessionAuthToken,
            path: '/api/v1/class/create',
            content: `class HelloWorld 
                {
                    sayHello() { console.log('Hello');
                }
            }`,
            storeAuthToken: process.env.GIT
        });
    });
    it('should get an instance', () => {
        expect(instance).toBeDefined();
    });
    it('should have a matchPath member', () => {
        expect(instance.matchPath).toBeDefined();
    });
    it('should have a handle member', () => {
        expect(instance.handle).toBeDefined();
    });
});