import {
    allEndpoints
} from '../../../../lib/endpoints/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
fdescribe('when getting a class from the store given that the file does NOT exist', () => {
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
        const { statusMessage, responseContent, contentType } = await createClassEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        ({ message, content } = JSON.parse(responseContent));
    });
    it('should return a message', async () => {
        expect(message).toBeDefined();
        expect(message).toBe('active-object-class.js was created');
    });
    it('should NOT provide file content', async () => {
        expect(content).not.toBeDefined();
    });
});