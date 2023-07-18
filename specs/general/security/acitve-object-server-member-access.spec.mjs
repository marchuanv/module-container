import { ActiveObjectServer } from '../../../lib/registry.mjs';
describe('when-accessing-non-declared-members', () => {
    let error;
    beforeAll(async () => {
        const server = new ActiveObjectServer();
        expect(server).toBeDefined();
        expect(server).toBeInstanceOf(ActiveObjectServer);
        try {
            server.logging;
        } catch (err) {
            error = err;
        }
    });
    it('should return security error', () => {
        expect(error).toBeDefined();
        expect(error.message).toContain('Unable to access member: logging, it is private to: ActiveObjectServer');
    });
});