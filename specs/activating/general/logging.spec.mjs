import {
    Logging,
    Container
} from '../../../lib/index.mjs';
describe('when-activating-logging', () => {
    const container = new Container();
    beforeAll(() => {
        container.register(Logging);
    });
    it('should create an instance', () => {
        const { instance } = container.get('$logging');
        expect(instance).toBeInstanceOf(Logging);
    });
});