import { Class } from './class.mjs';
describe('when accessing a private member of a class given a different calling context', () => {
    it('should return a security error and no return value', async () => {
        let error;
        let returnValue;
        const instance = new Class();
        try {
            await instance.publicMethod();
            returnValue = await instance.classDependency;
        } catch (err) {
            error = err;
        }
        expect(returnValue).not.toBeDefined();
        expect(error).toBeDefined();
        expect(error.message).toBe('classDependency member is private for Class');
    });
});
describe('when accessing a private member of a class given a public method that calls it from the class calling context', () => {
    it('should NOT return a security error and respond with success', async () => {
        let error;
        let returnValue;
        const instance = new Class();
        try {
            returnValue = await instance.publicMethod();
        } catch (err) {
            error = err;
        }
        expect(returnValue).toBeDefined();
        expect(error).not.toBeDefined();
    });
});