import {
    Route,
    Github
} from '../../lib/registry.mjs';
import { GithubFake } from '../fakes/registry.mjs';
fdescribe('when-handling-routing-given-get-config-endpoint', () => {
    let response;
    beforeAll(async () => {
        const route = new Route({
            path: '/api/v1/config/get',
            content: JSON.stringify({
                className: 'HelloWorld',
                language: 'JavaScript',
                dependencyInjection: false
            }),
            token: process.env.GIT
        });
        await route.mock({ Class: Github, FakeClass: GithubFake });
        response = await route.handle();
    });
    it('should instruct get-config-endpoint to handle the request and return the response', () => {
        expect(response).toBeDefined();
    });
});