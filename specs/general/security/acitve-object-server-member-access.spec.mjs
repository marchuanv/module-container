import {
    ActiveObjectServer, Github,
} from '../../../lib/registry.mjs';
import { GithubFake } from '../../fakes/registry.mjs';
describe('when-accessing-non-declared-members', () => {
    let error;
    beforeAll(() => {
        const server = new ActiveObjectServer();
        server.mock({ Class: Github, FakeClass: GithubFake });
        expect(server).toBeDefined();
        expect(server).toBeInstanceOf(ActiveObjectServer);
        try {
            server.logging;
        } catch (err) {
            error = err;
        }
    });
    it('should return security error', () => {
        expect(error.message).toBe('Unable to access property: logging, it is private to: ActiveObjectServer');
    });
});