import {
    Container
} from '../../../../lib/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when deleting config from the store given that the file exists', () => {
    let { message, content } = {};
    let { $logging, $store, $deleteConfigEndpoint, $createConfigEndpoint } = new Container();
    beforeAll(async () => {
        $logging.setToInfo();
        await $store.login();
        {
            const { statusMessage } = await $createConfigEndpoint.handle({
                content: JSON.stringify({
                    className: 'HelloWorld',
                    language: 'JavaScript',
                    dependencyInjection: false
                })
            });
            expect(statusMessage).toBe('200 Success');
        }
        const { statusMessage, responseContent, contentType } = await $deleteConfigEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        ({ message, content } = JSON.parse(responseContent));
    });
    it('should return a message', async () => {
        expect(message).toBeDefined();
        expect(message).toBe(`active-object-config.json was removed`);
    });
    it('should NOT provide the file content', async () => {
        expect(content).not.toBeDefined();
    });
    afterAll(async () => {
        await $store.logout();
    });
});