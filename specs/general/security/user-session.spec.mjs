import { UserSession } from '../../../lib/registry.mjs';
fdescribe('when authenticating a user given clear text passphrase', () => {
    let isAuthenticated;
    beforeAll(async() => {
        const userCredentials = { username:'Joe', passphrase: 'Joe1234', storeAuthToken: 12345 };
        const user = new UserSession(userCredentials);
        isAuthenticated = await user.isAuthenticated();
    });
    it('should succesfully authenticate', async () => {
        expect(isAuthenticated).toBeTrue();
    });
});
describe('when authorising a session given valid cridentials', () => {
    let isAuthorised;
    beforeAll(async() => {
        const user = { username:'Joe', secret: 'Joe1234' };
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
        const user = { username:'Joe', secret: 'Joe12345' };
        const session = new UserSession(user);
        isAuthorised = await session.authenticate();
    });
    it('should NOT authorise the session ', async () => {
        expect(isAuthorised).toBeFalse();
    });
});