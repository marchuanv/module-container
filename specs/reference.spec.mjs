import { Reference } from '../lib/reference/reference.mjs';
describe('when creating a reference', () => {
    it('should', () => {
        let error;
        let references;
        try {
            const refA = Reference.create({ object: { name: 'referenceA', Id: 'referenceAId' } });
            Reference.create({ object: { name: 'referenceB', Id: 'referenceBId' }, reference: refA });
            references = Reference.references({ Id: 'referenceBId' });
        } catch (err) {
            error = err;
        }
        expect(error).not.toBeDefined();
        expect(references.referenceA).toBeDefined();
    });
});
