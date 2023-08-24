import { Reference } from '../lib/reference.mjs';
fdescribe('when creating a reference', () => {
    it('should', () => {
        let error;
        let references;
        try {
            const refA = Reference.create({ name: 'referenceA', object: { Id: 'referenceAId' } });
            Reference.create({ name: 'referenceB', object: { Id: 'referenceBId' }, reference: refA });
            references = Reference.references({ Id: 'referenceBId' });
        } catch (err) {
            error = err;
        }
        expect(error).not.toBeDefined();
        expect(references.referenceA).toBeDefined();
    });
});
