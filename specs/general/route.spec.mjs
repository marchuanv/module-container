import { Route } from '../../lib/registry.mjs';
describe('when-getting-config-given-a-route', () => {
    beforeAll(async () => {
        const createRoute = new Route({
            path: '/api/v1/config/create',
            content: JSON.stringify({
                className: 'HelloWorld',
                language: 'JavaScript',
                dependencyInjection: false
            }),
            token: process.env.GIT
        });
        const res = await createRoute.handle();
        expect(res).toBeDefined();
        expect(res.statusCode).toBe(200);
        expect(res.statusMessage).toBe('200 Success');
        expect(res.responseContent).toBe('{\n    "message": "active-object-config.json was created"\n}');
    });
    it('should instruct the get-config-endpoint to handle the request and return a success response', async () => {
        const getRoute = new Route({ path: '/api/v1/config/get', token: process.env.GIT });
        const res = await getRoute.handle();
        expect(res).toBeDefined();
        expect(res.statusCode).toBe(200);
        expect(res.statusMessage).toBe('200 Success');
        expect(res.responseContent).toBe(`{\n    \"message\": \"Success\",\n    \"content\": {\n        \"className\": \"HelloWorld\",\n        \"language\": \"JavaScript\",\n        \"dependencyInjection\": false\n    }\n}`);
    });
    afterAll(async () => {
        const deleteRoute = new Route({
            path: '/api/v1/config/delete',
            token: process.env.GIT
        });
        const res = await deleteRoute.handle();
        expect(res).toBeDefined();
        expect(res.statusCode).toBe(200);
        expect(res.statusMessage).toBe('200 Success');
        expect(res.responseContent).toBe(`{\n    "message": "active-object-config.json was removed"\n}`);
    });
});
describe('when-getting-a-class-given-a-route', () => {
    beforeAll(async () => {
        const createRoute = new Route({
            path: '/api/v1/class/create',
            content: `class HelloWorld {
                sayHello() {
                    console.log('Hello');
                }
            }`,
            token: process.env.GIT
        });
        const res = await createRoute.handle();
        expect(res).toBeDefined();
        expect(res.statusCode).toBe(200);
        expect(res.statusMessage).toBe('200 Success');
        expect(res.responseContent).toBe('{\n    "message": "active-object-class.js was created"\n}');
    });
    it('should instruct the get-class-endpoint to handle the request and return a success response', async () => {
        const getRoute = new Route({ path: '/api/v1/class/get', token: process.env.GIT });
        const res = await getRoute.handle();
        expect(res).toBeDefined();
        expect(res.statusCode).toBe(200);
        expect(res.statusMessage).toBe('200 Success');
        expect(res.responseContent).toBe(`{\n    "message": "Success",\n    "content": "class HelloWorld {                sayHello() {                    console.log('Hello');                }            }"\n}`);
    });
    afterAll(async () => {
        const deleteRoute = new Route({
            path: '/api/v1/class/delete',
            token: process.env.GIT
        });
        const res = await deleteRoute.handle();
        expect(res).toBeDefined();
        expect(res.statusCode).toBe(200);
        expect(res.statusMessage).toBe('200 Success');
        expect(res.responseContent).toBe(`{\n    "message": "active-object-class.js was removed"\n}`);
    });
});