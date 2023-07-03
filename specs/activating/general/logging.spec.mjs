import {
    Container,
} from '../../../lib/registry.mjs';
describe('when-activating-logging', () => {
    let $logging;
    beforeAll(() => {
        const container = new Container();
        ({ $logging } = container);
    });
    it('should get an instance', () => {
        expect($logging).toBeDefined();
    });
    it('should have a setToInfo member', () => {
        expect($logging.setToInfo).toBeDefined();
    });
    it('should have a setToError member', () => {
        expect($logging.setToError).toBeDefined();
    });
    it('should have a log member', () => {
        expect($logging.log).toBeDefined();
    });
});