import { SpecsHelper } from './specs-helper.mjs';
describe('when calling the get class endpoint given that the class exist', () => {
    it('should respond with success', async () => {
        const getClassEndpoint = await SpecsHelper.ctorGetClassEndpointExists();
        const { statusMessage, content, contentType } = await getClassEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        expect(content).toBe('{\n    \"message\": \"Success\",\n    \"content\": \"class HelloWorld { sayHello() { console.log(\"hello\"); }}\"\n}');
    });
});
describe('when calling the create class endpoint given that the class exist', () => {
    it('should respond with conflict', async () => {
        const createClassEndpoint = await SpecsHelper.ctorCreateClassEndpointExists();
        const { statusMessage, content, contentType } = await createClassEndpoint.handle();
        expect(statusMessage).toBe('409 Conflict');
        expect(contentType).toBe('application/json');
        expect(content).toBe('{\n    "message": "active-object-class.js already exist"\n}');
    });
});
describe('when calling the delete class endpoint given that the class exist', () => {
    it('should respond with success', async () => {
        const deleteClassEndpoint = await SpecsHelper.ctorDeleteClassEndpointExists();
        const { statusMessage, content, contentType } = await deleteClassEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        expect(content).toBe('{\n    "message": "active-object-class.js was removed"\n}');
    });
});