import { allEndpoints } from '../../../lib/endpoints/registry.mjs';
import { Github } from '../../../lib/registry.mjs';
import { GithubFake } from '../../fakes/registry.mjs';
describe('when-activating-create-config-endpoint', () => {
    let instance;
    beforeAll(async () => {
        instance = new allEndpoints.v1.CreateConfigEndpoint({
            path: '/api/v1/config/create',
            content: JSON.stringify({ className: 'HelloWorld', language: 'JavaScript', dependencyInjection: false }),
            token: process.env.GIT
        });
        await instance.mock({ Class: Github, FakeClass: GithubFake });
    });
    it('should get an instance', () => {
        expect(instance).toBeDefined();
    });
    it('should have a matchPath member', () => {
        expect(instance.matchPath).toBeDefined();
    });
});