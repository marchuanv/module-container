import { Logging } from '../../lib/logging.mjs';
describe('when logging messages given context', () => {
    let logging;
    beforeAll((done) => {
        logging = new Logging({ contextId: 'CONTEXT A' });
        logging.log('Hello World 1');
        logging.log('Hello World 2');
        logging.log('Hello World 3');
        logging.log('Hello World 4');
        setTimeout(() => {
            logging = new Logging({ contextId: 'CONTEXT B' });
            logging.error('Hello World 5');
            logging.error('Hello World 6');
            logging.error('Hello World 7');
            logging.error('Hello World 8');
            setTimeout(() => {
                done();
            } ,1000);
        } ,1000);
    });
    it('should display messages', async () => {
    });
});