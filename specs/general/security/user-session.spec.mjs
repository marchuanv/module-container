import { UserSession } from '../../../lib/registry.mjs';
fdescribe('when authenticating a user given clear text passphrase', () => {
    const userCredentials = { username:'Joe', passphrase: 'Joe1234', storeAuthToken: 12345, sessionAuthToken: null };
    beforeAll(async() => {
        const userSession = new UserSession(userCredentials);
        await userSession.register();
        userCredentials.sessionAuthToken = await userSession.authenticate();
        expect(userCredentials.sessionAuthToken).toBeDefined();
    });
    it('should succesfully authenticate', async () => {
        const userSession = new UserSession(userCredentials);
        const isAuthenticated = await userSession.isAuthenticated();
        expect(isAuthenticated).toBeTrue();
    });
});
describe('when authorising a session given valid cridentials', () => {
    let isAuthorised;
    beforeAll(async() => {
        const session = new UserSession(user);
        isAuthorised = await session.authenticate();
    });
    it('should authorise the session ', async () => {
        expect(isAuthorised).toBeTrue();
    });
});
describe('when authorising a session given invalid cridentials', () => {
    let isAuthorised;
    beforeAll(async() => {
        const session = new UserSession(user);
        isAuthorised = await session.authenticate();
    });
    it('should NOT authorise the session ', async () => {
        expect(isAuthorised).toBeFalse();
    });
});