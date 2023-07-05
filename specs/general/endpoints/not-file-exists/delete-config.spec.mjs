import {
    allEndpoints
} from '../../../../lib/endpoints/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when deleting config from the store given that the file does NOT exist', () => {
    let { message, content } = {};
    beforeAll(async () => {
        let deleteConfigEndpoint = new allEndpoints.v1.DeleteClassEndpoint();
        const { statusMessage, responseContent, contentType } = await deleteConfigEndpoint.handle();
        expect(statusMessage).toBe('404 Not Found');
        expect(contentType).toBe('application/json');
        ({ message, content } = JSON.parse(responseContent));
    });
    it('should return a message', async () => {
        expect(message).toBeDefined();
        expect(message).toBe(`active-object-config.json was not found`);
    });
    it('should NOT provide the file content', async () => {
        expect(content).not.toBeDefined();
    });
});