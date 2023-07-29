import { SpecsHelper } from './specs-helper.mjs';
describe('when getting config given a route and config does not exist', () => {
    it('should instruct the get config endpoint to handle the request and return a not found response', async () => {
        const route = await SpecsHelper.ctorGetConfigRoute();
        const response = await route.handle();
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(404);
        expect(response.statusMessage).toBe('404 Not Found');
        expect(response.content).toBe('{\n    "message": "active-object-config.json was not found"\n}');
    });
});
describe('when getting config given a route and config exists', () => {
    it('should instruct the get config endpoint to handle the request and return a success response', async () => {
        const route = await SpecsHelper.ctorGetConfigRouteExists();
        const response = await route.handle();
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);
        expect(response.statusMessage).toBe('200 Success');
        expect(response.content).toBe(`{\n    \"message\": \"Success\",\n    \"content\": {\n        \"className\": \"HelloWorld\",\n        \"language\": \"JavaScript\",\n        \"dependencyInjection\": false\n    }\n}`);
    });
});