import {
    Container
} from '../../../../lib/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when getting config from the store given that the file exists', () => {
    let expectedConfig = JSON.stringify({
        className: 'HelloWorld',
        language: 'JavaScript',
        dependencyInjection: false
    });
    let { message, content } = {};
    let { $logging, $store, $createConfigEndpoint } = new Container();
    beforeAll(async () => {
        $logging.setToInfo();
        await $store.login();
        {
            const { statusMessage } = await $createConfigEndpoint.handle({ content: expectedConfig });
            expect(statusMessage).toBe('200 Success');
        }
        const { statusMessage, responseContent, contentType } = await $createConfigEndpoint.handle({ content: expectedConfig });
        expect(statusMessage).toBe('409 Conflict');
        expect(contentType).toBe('application/json');
        ({ message, content } = JSON.parse(responseContent));
    });
    it('should return a message', async () => {
        expect(message).toBeDefined();
        expect(message).toBe('active-object-config.json already exist');
    });
    it('should NOT provide file content', async () => {
        expect(content).not.toBeDefined();
    });
    afterAll(async () => {
        await $store.logout();
    });
});