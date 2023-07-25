import { UserSession } from '../../lib/registry.mjs';
const userCredentials = { 
    username:'Joe',
    passphrase: 'Joe1234',
    storeAuthToken: 12345
};
fdescribe('when registering a user given a valid username', () => {
    let isRegistered;
    beforeAll(async() => {
        const user = new UserSession(userCredentials);
        isRegistered = await user.register();
    });
    it('should register user', async () => {
        expect(isRegistered).toBeTrue();
    });
});
fdescribe('when registering a user given an existing user', () => {
    let isRegistered;
    beforeAll(async() => {
        const user = new UserSession(userCredentials);
        isRegistered = await user.register();
    });
    it('should NOT register user', async () => {
        expect(isRegistered).toBeFalse();
    });
});