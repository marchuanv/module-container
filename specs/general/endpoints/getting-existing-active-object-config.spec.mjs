import {
    Container
} from '../../../lib/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when getting existing active object config from the store', () => {
    let { message, content } = {};
    beforeAll(async () => {
        let { $logging, $store, $getConfigEndpoint, $createConfigEndpoint } = new Container();
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
        const { statusMessage, responseContent, contentType } = await $getConfigEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        ({ message, content } = JSON.parse(responseContent));
    });
    it('should return message', async () => {
        expect(message).toBeDefined();
        expect(message).toBe('Success');
    });
    it('should return content', async () => {
        expect(content).toBeDefined();
        expect(content.className).toBe('HelloWorld');
        expect(content.language).toBe('JavaScript');
        expect(content.dependencyInjection).toBeFalse();
    });
    afterAll(async () => {
        let { $store } = new Container();
        await $store.logout();
    });
});