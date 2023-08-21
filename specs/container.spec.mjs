import { Container } from '../lib/container.mjs';
import { Class, ClassDependencyMock, ClassDependencySingleton } from './class.mjs';
describe('when creating an instance of the container class', () => {
    it('should get an error', () => {
        let error;
        try {
            new Container();
        } catch (err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBeDefined();
        expect(error.message).toBe('Container is an abstract class');
    });
});
describe('when creating an instance of a class that extends the container class', () => {
    it('should NOT get an error', () => {
        let error;
        try {
            new Class();
        } catch (err) {
            error = err;
        }
        expect(error).not.toBeDefined();
    });
});
describe('when creating an instance of a given a dependency on a singleton class', () => {
    it('should create an instance', async () => {
        let error;
        let instanceA;
        let instanceB;
        let dependencyInstanceA;
        let dependencyInstanceB;
        let propertyA;
        let propertyB;
        try {
            instanceA = new Class();
            instanceB = new Class();
            dependencyInstanceA = await instanceA.getSingletonClassDependency();
            dependencyInstanceB = await instanceB.getSingletonClassDependency();
            await dependencyInstanceA.setProperty("overwrite");
            propertyA = await dependencyInstanceA.getProperty();
            propertyB = await dependencyInstanceB.getProperty();
        } catch (err) {
            error = err;
        }
        expect(error).not.toBeDefined();
        expect(instanceA).toBeDefined();
        expect(instanceB).toBeDefined();
        expect(instanceA).toBeInstanceOf(Class);
        expect(instanceB).toBeInstanceOf(Class);
        expect(dependencyInstanceA).toBeDefined();
        expect(dependencyInstanceB).toBeDefined();
        expect(dependencyInstanceA).toBeInstanceOf(ClassDependencySingleton);
        expect(dependencyInstanceB).toBeInstanceOf(ClassDependencySingleton);
        expect(instanceA.contextId).not.toBe(instanceB.contextId);
        expect(propertyA).toBe("overwrite");
        expect(propertyB).toBe("overwrite");
    });
});
describe('when creating an instance of a given a dependency on a non-singleton class', () => {
    it('should create an instance', async () => {
        let error;
        let instanceA;
        let instanceB;
        let dependencyInstanceA;
        let dependencyInstanceB;
        let propertyA;
        let propertyB;
        try {
            instanceA = new Class();
            instanceB = new Class();
            dependencyInstanceA = await instanceA.getClassDependency();
            dependencyInstanceB = await instanceB.getClassDependency();
            await dependencyInstanceA.setProperty("overwrite");
            propertyA = await dependencyInstanceA.getProperty();
            propertyB = await dependencyInstanceB.getProperty();
        } catch (err) {
            error = err;
        }
        expect(error).not.toBeDefined();
        expect(instanceA).toBeDefined();
        expect(instanceB).toBeDefined();
        expect(instanceA).toBeInstanceOf(Class);
        expect(instanceB).toBeInstanceOf(Class);
        expect(dependencyInstanceA).toBeDefined();
        expect(dependencyInstanceB).toBeDefined();
        expect(dependencyInstanceA).toBeInstanceOf(ClassDependencyMock);
        expect(dependencyInstanceB).toBeInstanceOf(ClassDependencyMock);
        expect(instanceA.contextId).not.toBe(instanceB.contextId);
        expect(propertyA).toBe("overwrite");
        expect(propertyB).toBe("default");
    });
});