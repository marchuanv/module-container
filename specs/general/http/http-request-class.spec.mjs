import { SpecsHelper } from '../../specs-helper.mjs';
fdescribe('when-starting-an-active-object-server-given-a-request-for-getting-class', () => {
    it('should instruct route to handle the request and respond with class not found', async () => {
        const response = await SpecsHelper.activeObjectServerHttpGetClass();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.statusText).toBe('404 Not Found');
        expect(response.status).toBe(404);
        expect(content.message).toBe('active-object-class.js was not found');
    });
});
fdescribe('when-starting-an-active-object-server-given-a-request-for-create-class', () => {
    it('should instruct route to handle the request and respond with class created', async () => {
        const response = await SpecsHelper.activeObjectServerHttpCreateClass();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.statusText).toBe('200 Success');
        expect(content.message).toBe('active-object-class.js was created');
    });
});
fdescribe('when-starting-an-active-object-server-given-a-request-for-deleting-class', () => {
    it('should instruct route to handle the request and respond with class deleted', async () => {
        const response = await SpecsHelper.activeObjectServerHttpDeleteConfig();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.status).toBe(404);
        expect(response.statusText).toBe('404 Not Found');
        expect(content.message).toBe('active-object-config.json was not found');
    });
});