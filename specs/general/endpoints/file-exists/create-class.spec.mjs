import {
    allEndpoints
} from '../../../../lib/endpoints/registry.mjs';
import { Github } from '../../../../lib/registry.mjs';
import { GithubFake } from '../../../fakes/registry.mjs';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
describe('when getting a class from the store given that the file exists', () => {
    let { message, content } = {};
    beforeAll(async () => {
        const args = {
            token: process.env.GIT,
            path: '/api/v1/class/create',
            content: `
                class HelloWorld {
                    sayHello() {
                        console.log("hello");
                    }
                }`
        };
        let createClassEndpoint = new allEndpoints.v1.CreateClassEndpoint(args);
        await createClassEndpoint.mock({ Class: Github, FakeClass: GithubFake });
        {
            const { statusMessage } = await createClassEndpoint.handle();
            expect(statusMessage).toBe('200 Success');
        }
        const { statusMessage, responseContent, contentType } = await createClassEndpoint.handle();
        expect(statusMessage).toBe('409 Conflict');
        expect(contentType).toBe('application/json');
        ({ message, content } = JSON.parse(responseContent));
    });
    it('should return a message', async () => {
        expect(message).toBeDefined();
        expect(message).toBe('active-object-class.js already exist');
    });
    it('should NOT provide file content', async () => {
        expect(content).not.toBeDefined();
    });
});