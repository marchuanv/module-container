import { allEndpoints } from '../../../lib/endpoints/registry.mjs';
import { Github } from '../../../lib/registry.mjs';
import { GithubFake } from '../../fakes/registry.mjs';
describe('when-activating-get-config-endpoint', () => {
    let instance;
    beforeAll(async () => {
        instance = new allEndpoints.v1.GetConfigEndpoint({
            path: '/api/v1/config/get',
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