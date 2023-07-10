import {
    Route,
    Github
} from '../../../lib/registry.mjs';
import { GithubFake } from '../../fakes/registry.mjs';
describe('when-activating-endpoint-registry', () => {
    let route;
    beforeAll(() => {
        route = new Route({ path: '/api/v1/config/get', content: '', token: process.env.GIT });
        route.mock({ Class: Github, FakeClass: GithubFake });
    });
    it('should create an instance', () => {
        expect(route).toBeDefined();
    });
    it('should have a handle member', () => {
        expect(route.handle).toBeDefined();
    });
});