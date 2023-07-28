import { SpecsHelper } from './specs-helper.mjs';
describe('when making a request for getting config given a started active object server', () => {
    it('should instruct route to handle the request and respond with config not found', async () => {
        const response = await SpecsHelper.activeObjectServerHttpGetConfig();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.status).toBe(404);
        expect(response.statusText).toBe('404 Not Found');
        expect(content.message).toBe('active-object-config.json was not found');
    });
});
describe('when making a request for getting config given a started active object server and config exists', () => {
    it('should instruct route to handle the request and respond with config found', async () => {
        const response = await SpecsHelper.activeObjectServerHttpGetConfigExists();
        const content = await response.text();
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.statusText).toBe('200 Success');
        expect(content).toBe('{\n    \"message\": \"Success\",\n    \"content\": {\n        \"className\": \"HelloWorld\",\n        \"language\": \"JavaScript\",\n        \"dependencyInjection\": false\n    }\n}');
    });
});
describe('when making a request for creating config given a started active object server', () => {
    it('should instruct route to handle the request and respond with config created', async () => {
        const response = await SpecsHelper.activeObjectServerHttpCreateConfig();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.statusText).toBe('200 Success');
        expect(content.message).toBe('active-object-config.json was created');
    });
});
describe('when making a request for creating config given a started active object server and config exists', () => {
    it('should instruct route to handle the request and respond with config exists', async () => {
        const response = await SpecsHelper.activeObjectServerHttpCreateConfigExists();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.status).toBe(409);
        expect(response.statusText).toBe('409 Conflict');
        expect(content.message).toBe('active-object-config.json already exist');
    });
});
describe('when making a request for deleting config given a started active object server', () => {
    it('should instruct route to handle the request and respond with config not found', async () => {
        const response = await SpecsHelper.activeObjectServerHttpDeleteConfig();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.status).toBe(404);
        expect(response.statusText).toBe('404 Not Found');
        expect(content.message).toBe('active-object-config.json was not found');
    });
});
describe('when making a request for deleting config given a started active object server and config exists', () => {
    it('should instruct route to handle the request and respond with config deleted', async () => {
        const response = await SpecsHelper.activeObjectServerHttpDeleteConfigExists();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.statusText).toBe('200 Success');
        expect(content.message).toBe('active-object-config.json was removed');
    });
});