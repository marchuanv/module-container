import {
    Container
} from '../../../lib/registry.mjs';
describe('when getting existing active object config from the store', () => {
    let statusMessage;
    let responseContent;
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
        ({ statusMessage, responseContent } = await $getConfigEndpoint.handle());
        expect(statusMessage).toBe('200 Success');
        responseContent = JSON.parse(responseContent);
    });
    it('should return content', async () => {
        expect(responseContent).toBeDefined();
        expect(responseContent.className).toBe('HelloWorld');
        expect(responseContent.language).toBe('JavaScript');
        expect(responseContent.dependencyInjection).toBeFalse();
    });
    afterAll(async () => {
        let { $store } = new Container();
        await $store.logout();
    });
});