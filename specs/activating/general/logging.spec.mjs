import {
    Container,
} from '../../../lib/registry.mjs';
describe('when-activating-logging', () => {
    let $logging;
    beforeAll(() => {
        const container = new Container();
        ({ $logging } = container);
    });
    it('should create an instance', () => {
        expect($logging).toBeDefined();
        expect($logging.setLevel).toBeDefined();
        expect($logging.log).toBeDefined();
    });
});