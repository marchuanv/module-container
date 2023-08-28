import { Container } from '../lib/container.mjs';
import { TestClasSingletonDependency, TestClass, TestClassDependency, TestClassDependency2, TestClassMultipleInstancesForOneDependency, TestClassSingletons } from './class.mjs';
describe('when creating an instance of the container class', () => {
    it('should get an error', () => {
        let error;
        try {
            new Container({
                root: {
                    container: {
                        name: 'TestClassMultipleInstancesForOneDependency',
                        members: {
                            testClassDependency: {
                                args: {},
                                class: { TestClassDependency, TestClassDependency2 },
                            },
                            testClasSingletonDependency: {
                                args: {},
                                class: { TestClasSingletonDependency },
                            },
                            testClassMultipleInstancesForOneDependencySetup: {
                                args: {},
                                callback: async () => {
                                    this.log(`post constructor member called`);
                                }
                            },
                        },
                        behaviour: {
                            singleton: false,
                            errorHalt: true
                        }
                    }
                }
            });
        } catch (err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBeDefined();
        expect(error.message).toBe('Container is an abstract class');
    });
});
fdescribe('when creating an instance of a class that extends the container class', () => {
    it('should NOT get an error', () => {
        let error;
        try {
            new TestClass();
        } catch (err) {
            error = err;
        }
        expect(error).not.toBeDefined();
    });
});
describe('when creating an instance of a class given a dependency on a singleton class', () => {
    it('should create an instance', async () => {
        let error;
        let instanceA;
        let instanceB;
        let dependencyInstanceA;
        let dependencyInstanceB;
        let propertyA;
        let propertyB;
        try {
            instanceA = new TestClassSingletons();
            instanceB = new TestClassSingletons();
            dependencyInstanceA = await instanceA.getTestClasSingletonDependency();
            dependencyInstanceB = await instanceB.getTestClasSingletonDependency();
            propertyA = await dependencyInstanceA.getProperty();
            await dependencyInstanceA.setProperty("overwrite");
            propertyA = await dependencyInstanceA.getProperty();
            propertyB = await dependencyInstanceB.getProperty();
        } catch (err) {
            error = err;
        }
        expect(error).not.toBeDefined();
        expect(instanceA).toBeDefined();
        expect(instanceB).toBeDefined();
        expect(instanceA).toBeInstanceOf(TestClass);
        expect(instanceB).toBeInstanceOf(TestClass);
        expect(dependencyInstanceA).toBeDefined();
        expect(dependencyInstanceB).toBeDefined();
        expect(dependencyInstanceA).toBeInstanceOf(TestClasSingletonDependency);
        expect(dependencyInstanceB).toBeInstanceOf(TestClasSingletonDependency);
        expect(propertyA).toBe("overwrite");
        expect(propertyB).toBe("overwrite");
    });
});
describe('when creating an instance of a class given a dependency on a non-singleton class', () => {
    it('should create an instance', async () => {
        let error;
        let instanceA;
        let instanceB;
        let dependencyInstanceA;
        let dependencyInstanceB;
        let propertyA;
        let propertyB;
        try {
            instanceA = new TestClass();
            // instanceB = new TestClass();
            dependencyInstanceA = await instanceA.getTestClassDependency();
            // dependencyInstanceB = await instanceB.getTestClassDependency();
            return;
            await dependencyInstanceA.setProperty("overwrite");
            propertyA = await dependencyInstanceA.getProperty();
            propertyB = await dependencyInstanceB.getProperty();
        } catch (err) {
            error = err;
        }
        expect(error).not.toBeDefined();
        expect(instanceA).toBeDefined();
        expect(instanceB).toBeDefined();
        expect(instanceA).toBeInstanceOf(TestClass);
        expect(instanceB).toBeInstanceOf(TestClass);
        expect(dependencyInstanceA).toBeDefined();
        expect(dependencyInstanceB).toBeDefined();
        expect(dependencyInstanceA).toBeInstanceOf(TestClassDependency);
        expect(dependencyInstanceB).toBeInstanceOf(TestClassDependency);
        expect(propertyA).toBe("overwrite");
        expect(propertyB).toBe("default");
    });
});
describe('when creating an instance of a class that extends the container class given multiple class configuration for one dependency', () => {
    it('should return multiple instances the first time', async () => {
        let error;
        let instance;
        let dependencyInstanceA;
        let dependencyInstanceB;
        try {
            instance = new TestClassMultipleInstancesForOneDependency();
            const instances = await instance.getTestClassDependency();
            ([dependencyInstanceA, dependencyInstanceB] = instances);
        } catch (err) {
            error = err;
        }
        expect(error).not.toBeDefined();
        expect(instance).toBeDefined();
        expect(instance).toBeInstanceOf(TestClassMultipleInstancesForOneDependency);
        expect(dependencyInstanceA).toBeDefined();
        expect(dependencyInstanceB).toBeDefined();
        expect(dependencyInstanceA).toBeInstanceOf(TestClassDependency);
        expect(dependencyInstanceB).toBeInstanceOf(TestClassDependency2);
    });
    it('should return multiple instances the second time', async () => {
        let error;
        let instance;
        let dependencyInstanceA;
        let dependencyInstanceB;
        try {
            instance = new TestClassMultipleInstancesForOneDependency();
            const instances = await instance.getTestClassDependency();
            ([dependencyInstanceA, dependencyInstanceB] = instances);
        } catch (err) {
            error = err;
        }
        expect(error).not.toBeDefined();
        expect(instance).toBeDefined();
        expect(instance).toBeInstanceOf(TestClassMultipleInstancesForOneDependency);
        expect(dependencyInstanceA).toBeDefined();
        expect(dependencyInstanceB).toBeDefined();
        expect(dependencyInstanceA).toBeInstanceOf(TestClassDependency);
        expect(dependencyInstanceB).toBeInstanceOf(TestClassDependency2);
    });
});