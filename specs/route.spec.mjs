import { SpecsHelper } from './specs-helper.mjs';
describe('when-getting-config-given-a-route', () => {
    it('should instruct the get-config-endpoint to handle the request and return a success response', async () => {
        const configFilePath = 'active-object-config.json';
        await SpecsHelper.clearStore({ filePath: configFilePath });
        const route = await SpecsHelper.ctorGetConfigRoute();
        response = await route.handle();
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);
        expect(response.statusMessage).toBe('200 Success');
        expect(response.responseContent).toBe(`{\n    \"message\": \"Success\",\n    \"content\": {\n        \"className\": \"HelloWorld\",\n        \"language\": \"JavaScript\",\n        \"dependencyInjection\": false\n    }\n}`);
    });
});
describe('when-getting-a-class-given-a-route', () => {
    it('should instruct the get-class-endpoint to handle the request and return a success response', async () => {
        const classFilePath = 'active-object-class.js';
        await SpecsHelper.clearStore({ filePath: classFilePath });
        const route = await SpecsHelper.ctorGetClassRoute();
        response = await route.handle();
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);
        expect(response.statusMessage).toBe('200 Success');
        expect(response.responseContent).toBe(`{\n    "message": "Success",\n    "content": "class HelloWorld {                sayHello() {                    console.log('Hello');                }            }"\n}`);
    });
});