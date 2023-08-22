import { TestClass } from './class.mjs';
describe('when accessing a private member of a class given a different calling context', () => {
    it('should return a security error and no return value', async () => {
        let error;
        let returnValue;
        const instance = new TestClass();
        try {
            await instance.getTestClassDependency();
            returnValue = await instance.testClassDependency;
        } catch (err) {
            error = err;
        }
        expect(returnValue).not.toBeDefined();
        expect(error).toBeDefined();
        expect(error.message).toBe('testClassDependency member is private for TestClass');
    });
});
describe('when accessing a private member of a class given a public method that calls it from the class calling context', () => {
    it('should NOT return a security error and respond with success', async () => {
        let error;
        let returnValue;
        const instance = new TestClass();
        try {
            returnValue = await instance.getTestClassDependency();
        } catch (err) {
            error = err;
        }
        expect(returnValue).toBeDefined();
        expect(error).not.toBeDefined();
    });
});