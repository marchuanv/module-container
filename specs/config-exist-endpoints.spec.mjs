import { SpecsHelper } from './specs-helper.mjs';
describe('when calling the get config endpoint given that the config exist', () => {
    it('should respond with success', async () => {
        const getConfigEndpoint = await SpecsHelper.ctorGetConfigEndpointExists();
        const { statusMessage, content, contentType } = await getConfigEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        expect(content).toBe('{\n    \"message\": \"Success\",\n    \"content\": {\n        \"className\": \"HelloWorld\",\n        \"language\": \"JavaScript\",\n        \"dependencyInjection\": false\n    }\n}');
    });
});
describe('when calling the create config endpoint given that the config exist', () => {
    it('should respond with conflict', async () => {
        const createConfigEndpoint = await SpecsHelper.ctorCreateConfigEndpointExists();
        const { statusMessage, content, contentType } = await createConfigEndpoint.handle();
        expect(statusMessage).toBe('409 Conflict');
        expect(contentType).toBe('application/json');
        expect(content).toBe('{\n    "message": "active-object-config.json already exist"\n}');
    });
});
describe('when calling the delete config endpoint given that the config exist', () => {
    it('should respond with success', async () => {
        const deleteConfigEndpoint = await SpecsHelper.ctorDeleteConfigEndpointExists();
        const { statusMessage, content, contentType } = await deleteConfigEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        expect(content).toBe('{\n    "message": "active-object-config.json was removed"\n}');
    });
});