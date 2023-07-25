import utils from 'utils';
import { v1Endpoints } from '../../../../lib/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when creating a class in the store given that the file does NOT exist', () => {
    beforeAll(async () => {
        const createClassEndpoint = new v1Endpoints.CreateClassEndpoint({
            storeAuthToken: process.env.GIT,
            path: '/api/v1/class/create',
            content: `class HelloWorld {
                sayHello() {
                    console.log("hello");
                }
            }`
        });
        const { statusMessage, responseContent, contentType } = await createClassEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        const { message } = utils.getJSONObject(responseContent);
        expect(message).toBe('active-object-class.js was created');
    });
    it('should succesfully create the class', async () => {
        const getClassEndpoint = new v1Endpoints.GetClassEndpoint({
            storeAuthToken: process.env.GIT,
            path: '/api/v1/class/get'
        });
        const { statusMessage, responseContent, contentType } = await getClassEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        expect(responseContent).toBeDefined();
    });
    afterAll(async () => {
        const args = {
            storeAuthToken: process.env.GIT,
            path: '/api/v1/class/delete'
        }
        const deleteClassEndpoint = new v1Endpoints.DeleteClassEndpoint(args);
        const { statusMessage, contentType } = await deleteClassEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
    });
});