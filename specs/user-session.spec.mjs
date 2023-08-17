import { SpecsHelper } from './specs-helper.mjs';

describe('when registering a user session given a valid username and the user does not exist', () => {
    it('should register the user', async () => {
        const userSession = await SpecsHelper.ctorUserSession(true, false);
        const completed = await userSession.register();
        expect(completed).toBeTrue();
    });
});

describe('when registering a user session given an existing username', () => {
    it('should NOT register the user', async () => {
        const userSession = await SpecsHelper.ctorUserSession(false);
        const completed = await userSession.register();
        expect(completed).toBeFalse();
    });
});

describe('when authenticating an existing user given a clear text passphrase', () => {
    it('should succesfully authenticate', async () => {
        const userSession = await SpecsHelper.ctorUserSession(true, true);
        const token = await userSession.getSessionToken();
        expect(token).toBeDefined();
    });
});

describe('when authenticating an existing user given a hashed passphrase', () => {
    it('should succesfully authenticate', async () => {

        //create user session
        let userSession = await SpecsHelper.ctorUserSession(true, true);
        const username = `JOE`;
        const filePath = `${username}.json`;

        //get stored hashed passphrase
        const store = await SpecsHelper.ctorStore({ filePath });
        let content = await store.read();
        content = JSON.parse(content);
        expect(content).toBeDefined();
        const userContent = content[username.toLowerCase()];
        expect(userContent).toBeDefined();
        expect(userContent.storedHashedPassphrase).toBeDefined();
        const hashedPassphrase = userContent.storedHashedPassphrase;

        userSession = await SpecsHelper.ctorUserSession(false, false, { username, hashedPassphrase });
        const token = await userSession.getSessionToken();
        expect(token).toBeDefined();
    });
});