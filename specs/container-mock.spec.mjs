import { Class, ClassDependency, ClassDependencyMock } from './class.mjs';
describe('when creating an instance of Class given mock class configuration', () => {
    it('should create an instance of the mocked Class', async () => {
        process.environment.isProduction = false;
        const instance = new Class();
        const classDep = await instance.getClassDependency();
        expect(classDep).toBeInstanceOf(ClassDependencyMock);
    });
});
describe('when creating an instance of Class given no mock class configuration', () => {
    it('should create an instance of the Class', async () => {
        process.environment.isProduction = true;
        const instance = new Class();
        const classDep = await instance.getClassDependency();
        expect(classDep).toBeInstanceOf(ClassDependency);
        process.environment.isProduction = false;
    });
});