import { MockTestClass, TestClass, TestClassDependency, TestClassMockDependency } from './class.mjs';
describe('when creating an instance of Class given mock class configuration', () => {
    it('should create an instance of the mocked Class', async () => {
        process.environment.isProduction = false;
        const instance = new MockTestClass();
        const classDep = await instance.getTestClassMockDependency();
        expect(classDep).toBeInstanceOf(TestClassMockDependency);
    });
});
describe('when creating an instance of Class given no mock class configuration', () => {
    it('should create an instance of the Class', async () => {
        process.environment.isProduction = true;
        const instance = new TestClass();
        const classDep = await instance.getTestClassDependency();
        expect(classDep).toBeInstanceOf(TestClassDependency);
        process.environment.isProduction = false;
    });
});