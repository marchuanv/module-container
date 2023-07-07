import {
    Logging,
} from '../../../lib/registry.mjs';
describe('when-activating-logging', () => {
    let logging;
    beforeAll(() => {
        logging = new Logging({ logLevel: 'error' });
    });
    it('should create an instance', () => {
        expect(logging).toBeDefined();
    });
    it('should have a log member', () => {
        expect(logging.log).toBeDefined();
    });
});