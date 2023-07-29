import { SpecsHelper } from './specs-helper.mjs';
describe('when calling the get config endpoint given that the config does not exist', () => {
    it('should respond with not found', async () => {
        const getConfigEndpoint = await SpecsHelper.ctorGetConfigEndpoint();
        const { statusMessage, content, contentType } = await getConfigEndpoint.handle();
        expect(statusMessage).toBe('404 Not Found');
        expect(contentType).toBe('application/json');
        expect(content).toBe('{\n    "message": "active-object-config.json was not found"\n}');
    });
});
describe('when calling the create config endpoint given that the config does not exist', () => {
    it('should respond with success', async () => {
        const createConfigEndpoint = await SpecsHelper.ctorCreateConfigEndpoint();
        const { statusMessage, content, contentType } = await createConfigEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        expect(content).toBe('{\n    "message": "active-object-config.json was created"\n}');
    });
});
describe('when calling the delete config endpoint given that the config does not exist', () => {
    it('should respond with not found', async () => {
        const deleteConfigEndpoint = await SpecsHelper.ctorDeleteConfigEndpoint();
        const { statusMessage, content, contentType } = await deleteConfigEndpoint.handle();
        expect(statusMessage).toBe('404 Not Found');
        expect(contentType).toBe('application/json');
        expect(content).toBe('{\n    "message": "active-object-config.json was not found"\n}');
    });
});