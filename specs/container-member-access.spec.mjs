import { ContainerConfigTemplate } from '../lib/container-config-template.mjs';
import { ContainerConfig } from '../lib/container-config.mjs';
import { Container } from '../lib/container.mjs';
const configTemplate = new ContainerConfigTemplate();
const containerConfig = new ContainerConfig(configTemplate, {
    container: {
        testClass: {
            args: {},
            ctor: async () => { },
            isInterface: false,
            isSingleton: false,
            isHaltOnErrors: true,
            isPublic: true,
            referenceProperties: {
                testClassPublicProperty: {
                    args: {},
                    class: { otherTestClass: {} },
                    isPublic: true
                },
                testClassPrivateProperty: {
                    args: {},
                    class: { otherTestClass: {} },
                    isPublic: false
                }
            },
            staticProperties: {
                testClassPublicStaticValue: {
                    value: { message: 'this is static public property' },
                    isPublic: true
                },
                testClassPrivateStaticValue: {
                    value: { message: 'this is static private property' },
                    isPublic: false
                }
            },
            methods: {
                testClassFunctionPublic: {
                    args: {},
                    callback: async () => { },
                    isPublic: true
                },
                testClassFunctionPrivate: {
                    args: {},
                    callback: async () => { },
                    isPublic: false
                }
            }
        },
        otherTestClass: {
            args: {},
            ctor: async () => { },
            isInterface: false,
            isSingleton: false,
            isHaltOnErrors: true,
            isPublic: true,
            referenceProperties: {},
            staticProperties: {},
            methods: {}
        }
    }
});
fdescribe('when getting an instance', () => {
    it('should', async () => {
        const container = new Container(containerConfig);
        let instance;
        let instance2;
        let error;
        let property;
        try {
            instance = await container.getReference('testClass');
            instance2 = await container.getReference('otherTestClass');
            property = await instance.testClassPrivateProperty;
        } catch (err) {
            error = err;
            console.error(err);
        }
        expect(error).not.toBeDefined();
        expect(instance).toBeDefined();
    });
});
describe('when accessing a private member of a class given a different calling context', () => {
    it('should return a security error and no return value', async () => {
        let error;
        let returnValue;
        const instance = new Container(containerConfig);
        try {
            returnValue = await instance.testClassPrivateProperty;
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
        const instance = new Container(containerConfig);
        try {
            returnValue = await instance.testClassPublicProperty;
        } catch (err) {
            error = err;
        }
        expect(error).not.toBeDefined();
        expect(returnValue).toBeDefined();
    });
});