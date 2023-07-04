import {
    Container
} from '../../../lib/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when getting existing active object class from the store', () => {
    let expectedClass = `
        class HelloWorld {
            sayHello() {
                console.log("hello");
            }
        }`;
    let { message, content } = {};
    beforeAll(async () => {
        let { $logging, $store, $getClassEndpoint, $createClassEndpoint } = new Container();
        $logging.setToInfo();
        await $store.login();
        {
            const { statusMessage } = await $createClassEndpoint.handle({
                content: expectedClass
            });
            expect(statusMessage).toBe('200 Success');
        }
        const { statusMessage, responseContent } = await $getClassEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        ({ message, content } = JSON.parse(responseContent));
    });
    it('should return message', async () => {
        expect(message).toBeDefined();
        expect(message).toBe('Success');
    });
    it('should return content', async () => {
        expect(content).toBeDefined();
        expect(content).toBe(expectedClass);
    });
    afterAll(async () => {
        let { $store } = new Container();
        await $store.logout();
    });
});