import { SpecsHelper } from '../../specs-helper.mjs';
describe('when-starting-an-active-object-server-given-a-request-for-getting-config', () => {
    it('should instruct route to handle the request and respond with config not found', async () => {
        const response = await SpecsHelper.activeObjectServerHttpGetConfig();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.status).toBe(404);
        expect(response.statusText).toBe('404 Not Found');
        expect(content.message).toBe('active-object-config.json was not found');
    });
});
describe('when-starting-an-active-object-server-given-a-request-for-create-config', () => {
    it('should instruct route to handle the request and respond with config created', async () => {
        const response = await SpecsHelper.activeObjectServerHttpCreateConfig();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.statusText).toBe('200 Success');
        expect(content.message).toBe('active-object-config.json was created');
    });
});
describe('when-starting-an-active-object-server-given-a-request-for-deleting-config', () => {
    it('should instruct route to handle the request and respond with config deleted', async () => {
        const response = await SpecsHelper.activeObjectServerHttpDeleteConfig();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.status).toBe(404);
        expect(response.statusText).toBe('404 Not Found');
        expect(content.message).toBe('active-object-config.json was not found');
    });
});