import {
    allEndpoints
} from '../../../../lib/endpoints/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when getting a class from the store given that the file exists', () => {
    let { message, content } = {};
    beforeAll(async () => {
        let createClassEndpoint = new allEndpoints.v1.CreateClassEndpoint({
            path: '/api/v1/class/create',
            content: `
            class HelloWorld {
                sayHello() {
                    console.log("hello");
                }
            }`,
            headers: {}
        });
        let getClassEndpoint = new allEndpoints.v1.GetClassEndpoint();
        {
            const { statusMessage } = await createClassEndpoint.handle();
            expect(statusMessage).toBe('200 Success');
        }
        const { statusMessage, responseContent, contentType } = await getClassEndpoint.handle();
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
});