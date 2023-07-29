import { SpecsHelper } from './specs-helper.mjs';
fdescribe('when getting a class given a route and class does not exist', () => {
    it('should instruct the get class endpoint to handle the request and return a not found response', async () => {
        const route = await SpecsHelper.ctorGetClassRoute();
        const response = await route.handle();
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(404);
        expect(response.statusMessage).toBe('404 Not Found');
        expect(response.content).toBe('{\n    "message": "active-object-class.js was not found"\n}');
    });
});
describe('when getting a class given a route and class does exist', () => {
    it('should instruct the get class endpoint to handle the request and return a success response', async () => {
        const route = await SpecsHelper.ctorGetClassRouteExists();
        const response = await route.handle();
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);
        expect(response.statusMessage).toBe('200 Success');
        expect(response.content).toBe(`{\n    \"message\": \"Success\",\n    \"content\": \"class HelloWorld { sayHello() { console.log(\"hello\"); }}\"\n}`);
    });
});