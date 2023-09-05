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
                    class: { testClassA: {} },
                    isPublic: true
                },
                testClassPrivateProperty: {
                    args: {},
                    class: { testClassB: {} },
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
        testClassA: {
            args: {},
            ctor: async () => { },
            isInterface: false,
            isSingleton: false,
            isHaltOnErrors: true,
            isPublic: true,
            referenceProperties: {},
            staticProperties: {},
            methods: {}
        },
        testClassB: {
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
const container = new Container(containerConfig);
fdescribe('when directly accessing a private member of a class', () => {
    it('should return a security error and no return value', async () => {
        let error;
        let returnValue;
        try {
            const instance = await container.getReference('testClass');
            returnValue = await instance.testClassPrivateProperty;
        } catch (err) {
            error = err;
            console.log(err);
        }
        expect(returnValue).not.toBeDefined();
        expect(error).toBeDefined();
        expect(error.message).toBe('testClassPrivateProperty is private or not called from a valid context');
    });
});
fdescribe('when accessing a public member of a class', () => {
    it('should NOT return a security error and respond with success', async () => {
        let error;
        let returnValue;
        try {
            const instance = await container.getReference('testClass');
            returnValue = await instance.testClassPublicProperty;
        } catch (err) {
            error = err;
            console.log(err);
        }
        expect(returnValue).toBeDefined();
        expect(error).not.toBeDefined();
    });
});