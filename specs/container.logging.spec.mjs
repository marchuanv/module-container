import { TestClass, TestClassDependency } from './class.mjs';
describe('when creating an instance of a TestClass given a TestClassDependency', () => {
    it('should create call all members and log accordingly', async () => {
        let error;
        let testClass;
        let testClassDependency;
        let propertyValue;
        try {
            testClass = new TestClass();
            testClassDependency = await testClass.getTestClassDependency();
            propertyValue = await testClassDependency.getProperty();
            propertyValue = 'overwrite';
            await testClassDependency.setProperty(propertyValue);
            propertyValue = await testClassDependency.getProperty();
        } catch (err) {
            error = err;
        }
        expect(error).not.toBeDefined();
        expect(testClass).toBeDefined();
        expect(propertyValue).toBe('overwrite');
        expect(propertyValue).toBeDefined();
        expect(testClassDependency).toBeDefined();
        expect(testClass).toBeInstanceOf(TestClass);
        expect(testClassDependency).toBeInstanceOf(TestClassDependency);
    });
});