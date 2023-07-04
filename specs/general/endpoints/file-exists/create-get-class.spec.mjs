import {
    Container
} from '../../../../lib/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when getting a class from the store given that the file exists', () => {
    let expectedClass = `
        class HelloWorld {
            sayHello() {
                console.log("hello");
            }
        }`;
    let { message, content } = {};
    let { $logging, $store, $getClassEndpoint, $createClassEndpoint } = new Container();
    beforeAll(async () => {
        $logging.setToInfo();
        await $store.login();
        {
            const { statusMessage } = await $createClassEndpoint.handle({
                content: expectedClass
            });
            expect(statusMessage).toBe('200 Success');
        }
        const { statusMessage, responseContent, contentType } = await $getClassEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        ({ message, content } = JSON.parse(responseContent));
    });
    it('should return a message', async () => {
        expect(message).toBeDefined();
        expect(message).toBe('Success');
    });
    it('should provide the file content', async () => {
        expect(content).toBeDefined();
        expect(content).toBe(expectedClass);
    });
    afterAll(async () => {
        await $store.logout();
    });
});