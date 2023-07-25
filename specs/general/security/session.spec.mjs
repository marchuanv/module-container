import { Session } from '../../../lib/registry.mjs';
describe('when authorising a session given valid cridentials', () => {
    let isAuthorised;
    beforeAll(async() => {
        const user = { username:'Joe', secret: 'Joe1234' };
        const session = new Session(user);
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
        const session = new Session(user);
        isAuthorised = await session.authenticate();
    });
    it('should NOT authorise the session ', async () => {
        expect(isAuthorised).toBeFalse();
    });
});