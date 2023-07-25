import { ActiveObjectServer, UserSession } from '../../lib/registry.mjs';
describe('when-creating-an-active-object-server-given-a-request-for-geting-config', () => {
    let response;
    beforeAll(async () => {
        const userCredentials = { username:'Joe', passphrase: 'Joe1234', storeAuthToken: 12345 };
        const userSession = new UserSession(userCredentials);
        const isRegistered = await userSession.register();
        expect(isRegistered).toBeTrue();
        const sessionAuthToken = await userSession.authenticate();
        expect(sessionAuthToken).toBeDefined();
        const server = new ActiveObjectServer();
        await server.start();
        response = await fetch(`http://localhost:${process.env.PORT || 80}/api/v1/config/get`,{ 
            method: 'GET',
            headers: {
               username: 'JoE',
               sessionAuthToken
            }});
    });
    it('should handle request and setup a route', async () => {
        expect(response).toBeDefined();
        expect(response.status).toBe(404);
    });
});