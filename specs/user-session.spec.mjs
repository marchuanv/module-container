import { UserSession, Store } from '../lib/registry.mjs';
const userCredentials = {
    username: 'Joe1',
    passphrase: 'Joe1234',
    storeAuthToken: 12345
};
describe('when registering a user session given a valid username', () => {
    let completed;
    beforeAll(async () => {
        const userSession = new UserSession(userCredentials);
        completed = await userSession.register();
    });
    it('should register the user', async () => {
        expect(completed).toBeTrue();
    });
});
describe('when registering a user session given an existing username', () => {
    let completed;
    beforeAll(async () => {
        const userSession = new UserSession(userCredentials);
        await userSession.register();
        completed = await userSession.register();
    });
    it('should NOT register the user', async () => {
        expect(completed).toBeFalse();
    });
});
describe('when authenticating a user given clear text passphrase', () => {
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
describe('when authenticating a user given a hashed passphrase', () => {
    const userCredentials = { username:'Joe', passphrase: 'Joe1234', storeAuthToken: 12345, sessionAuthToken: null };
    beforeAll(async() => {
        
        //create user session
        const userSession = new UserSession(userCredentials);
        await userSession.register();

        //get stored hashed passphrase
        const store = new Store({ filePath: `${userCredentials.username}.json`, storeAuthToken: userCredentials.storeAuthToken });
        let content = await store.read();
        content = JSON.parse(content);
        expect(content).toBeDefined();
        const userContent = content[userCredentials.username.toLowerCase()];
        expect(userContent).toBeDefined();
        expect(userContent.storedHashedPassphrase).toBeDefined();
        userCredentials.hashedPassphrase = userContent.storedHashedPassphrase;
        userCredentials.passphrase = null;

        //create user session with hashed passphrase
        const userSession2 = new UserSession(userCredentials);
        userCredentials.sessionAuthToken = await userSession2.authenticate();
        expect(userCredentials.sessionAuthToken).toBeDefined();
    });
    it('should succesfully authenticate', async () => {
        const userSession = new UserSession(userCredentials);
        const isAuthenticated = await userSession.isAuthenticated();
        expect(isAuthenticated).toBeTrue();
    });
});