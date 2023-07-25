import { UserSession } from '../../lib/registry.mjs';
const userCredentials = { 
    username:'Joe',
    passphrase: 'Joe1234',
    storeAuthToken: 12345
};
describe('when registering a user session given a valid username', () => {
    let isRegistered;
    beforeAll(async() => {
        const user = new UserSession(userCredentials);
        isRegistered = await user.register();
    });
    it('should register the user', async () => {
        expect(isRegistered).toBeTrue();
    });
});
describe('when registering a user session given an existing username', () => {
    let isRegistered;
    beforeAll(async() => {
        const user = new UserSession(userCredentials);
        isRegistered = await user.register();
    });
    it('should NOT register the user', async () => {
        expect(isRegistered).toBeFalse();
    });
});