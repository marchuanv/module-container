import { UserSession } from '../../lib/registry.mjs';
const userCredentials = { 
    username:'Joe1',
    passphrase: 'Joe1234',
    storeAuthToken: 12345
};
describe('when registering a user session given a valid username', () => {
    let completed;
    beforeAll(async() => {
        const userSession = new UserSession(userCredentials);
        completed  = await userSession.register();
    });
    it('should register the user', async () => {
        expect(completed).toBeTrue();
    });
});
describe('when registering a user session given an existing username', () => {
    let completed;
    beforeAll(async() => {
        const userSession = new UserSession(userCredentials);
        await userSession.register();
        completed = await userSession.register();
    });
    it('should NOT register the user', async () => {
        expect(completed).toBeFalse();
    });
});