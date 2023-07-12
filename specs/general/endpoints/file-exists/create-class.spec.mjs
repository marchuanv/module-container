import utils from 'utils';
import {
    allEndpoints
} from '../../../../lib/endpoints/registry.mjs';
import { Github } from '../../../../lib/registry.mjs';
import { GithubFake } from '../../../fakes/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when getting a class from the store given that the file exists', () => {
    beforeAll(async () => {
        const createClassEndpoint = new allEndpoints.v1.CreateClassEndpoint({
            token: process.env.GIT,
            path: '/api/v1/class/create',
            content: `class HelloWorld {
                    sayHello() {
                        console.log("hello");
                    }
                }`
        });
        await createClassEndpoint.mock({ Class: Github, FakeClass: GithubFake });
        {
            const { statusMessage, responseContent, contentType } = await createClassEndpoint.handle();
            expect(statusMessage).toBe('200 Success');
            expect(contentType).toBe('application/json');
            const { message } = utils.getJSONObject(responseContent);
            expect(message).toBe('active-object-class.js was created');
        }
        const { statusMessage, responseContent, contentType } = await createClassEndpoint.handle();
        expect(statusMessage).toBe('409 Conflict');
        expect(contentType).toBe('application/json');
        const { message } = utils.getJSONObject(responseContent);
        expect(message).toBe('active-object-class.js already exist');
    });
    it('should succesfully create the class', async () => {
        const getClassEndpoint = new allEndpoints.v1.GetClassEndpoint({
            token: process.env.GIT,
            path: '/api/v1/class/get'
        });
        await getClassEndpoint.mock({ Class: Github, FakeClass: GithubFake });
        const { statusMessage, responseContent, contentType } = await getClassEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
        expect(responseContent).toBeDefined();
    });
    afterAll(async () => {
        const args = {
            token: process.env.GIT,
            path: '/api/v1/class/delete'
        }
        const deleteClassEndpoint = new allEndpoints.v1.DeleteClassEndpoint(args);
        await deleteClassEndpoint.mock({ Class: Github, FakeClass: GithubFake });
        const { statusMessage, contentType } = await deleteClassEndpoint.handle();
        expect(statusMessage).toBe('200 Success');
        expect(contentType).toBe('application/json');
    });
});