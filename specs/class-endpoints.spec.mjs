import { SpecsHelper } from './specs-helper.mjs';
describe('when calling the get class endpoint given that the class does not exist', () => {
    it('should respond with not found', async () => {
        const getClassEndpoint = await SpecsHelper.ctorGetClassEndpoint();
        const { statusMessage, content, contentType } = await getClassEndpoint.handle();
        expect(statusMessage).toBe('404 Not Found');
        expect(contentType).toBe('application/json');
        expect(content).toBe('{\n    "message": "active-object-class.js was not found"\n}');
    });
});
describe('when calling the create class endpoint given that the class does not exist', () => {
    it('should respond with success', async () => {
        const createClassEndpoint = await SpecsHelper.ctorCreateClassEndpoint();
        const { statusMessage, content, contentType } = await createClassEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        expect(content).toBe('{\n    "message": "active-object-class.js was created"\n}');
    });
});
describe('when calling the delete class endpoint given that the class does not exist', () => {
    it('should respond with not found', async () => {
        const deleteClassEndpoint = await SpecsHelper.ctorDeleteClassEndpoint();
        const { statusMessage, content, contentType } = await deleteClassEndpoint.handle();
        expect(statusMessage).toBe('404 Not Found');
        expect(contentType).toBe('application/json');
        expect(content).toBe('{\n    "message": "active-object-class.js was not found"\n}');
    });
});